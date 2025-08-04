import { type DevToolsEnhancerOptions, configureStore } from "@reduxjs/toolkit";
import type { NoteDirection } from "bsmap";
import { initStateWithPrevTab } from "redux-state-sync";
import { createStorage } from "unstorage";
import { default as ls } from "unstorage/drivers/localstorage";
import { default as ss } from "unstorage/drivers/session-storage";

import { patchEnvironmentName } from "$/helpers/packaging.helpers";
import { resolveDifficultyFromBeatmapId } from "$/helpers/song.helpers";
import { type LegacyStorageSchema, createDriver } from "$/services/storage.service";
import { autosaveWorker, filestore } from "$/setup";
import { type App, EventColor, EventEditMode, EventTool, type IGridPresets, type Member, ObjectTool } from "$/types";
import { omit } from "$/utils";
import { init, loadGridPresets, loadSession, loadSongs, loadUser, tick, updateEventsEditorCursor } from "./actions";
import { default as root } from "./features";
import { type StorageObserver, createAllSharedMiddleware, createStorageMiddleware } from "./middleware";
import { createEntityStorageMiddleware } from "./middleware/storage.middleware";
import {
	selectAllGridPresetIds,
	selectAnnouncements,
	selectAudioProcessingDelay,
	selectBeatDepth,
	selectBloomEnabled,
	selectDefaultObstacleDuration,
	selectEventsEditorColor,
	selectEventsEditorEditMode,
	selectEventsEditorMirrorLock,
	selectEventsEditorPreview,
	selectEventsEditorTool,
	selectEventsEditorTrackHeight,
	selectEventsEditorTrackOpacity,
	selectEventsEditorWindowLock,
	selectEventsEditorZoomLevel,
	selectGridPresetById,
	selectNew,
	selectNotesEditorDirection,
	selectNotesEditorTool,
	selectPacerWait,
	selectPlaybackRate,
	selectRenderScale,
	selectSnap,
	selectSongById,
	selectSongIds,
	selectSongVolume,
	selectTickType,
	selectTickVolume,
	selectUsername,
} from "./selectors";

const STORAGE_PREFIX = location.hostname === "localhost" ? "beatmapper" : "";

export type UserStorageObservers = {
	"user.new": StorageObserver<RootState, boolean>;
	"user.announcements": StorageObserver<RootState, string[]>;
	"user.username": StorageObserver<RootState, string>;
	"audio.offset": StorageObserver<RootState, number>;
	"graphics.scale": StorageObserver<RootState, number>;
	"graphics.bloom": StorageObserver<RootState, boolean>;
	"advanced.wait": StorageObserver<RootState, number>;
};
export type SessionStorageObservers = {
	"track.snap": StorageObserver<RootState, number>;
	"track.spacing": StorageObserver<RootState, number>;
	"playback.rate": StorageObserver<RootState, number>;
	"playback.volume": StorageObserver<RootState, number>;
	"tick.volume": StorageObserver<RootState, number>;
	"tick.type": StorageObserver<RootState, number>;
	"notes.tool": StorageObserver<RootState, number>;
	"notes.direction": StorageObserver<RootState, NoteDirection>;
	"notes.duration": StorageObserver<RootState, number>;
	"events.mode": StorageObserver<RootState, number>;
	"events.tool": StorageObserver<RootState, number>;
	"events.color": StorageObserver<RootState, number>;
	"events.zoom": StorageObserver<RootState, number>;
	"events.opacity": StorageObserver<RootState, number>;
	"events.height": StorageObserver<RootState, number>;
	"events.preview": StorageObserver<RootState, boolean>;
	"events.loop": StorageObserver<RootState, boolean>;
	"events.mirror": StorageObserver<RootState, boolean>;
};

const driver = createDriver<LegacyStorageSchema & { songs: { key: string; value: App.ISong }; grids: { key: keyof IGridPresets; value: Member<IGridPresets> } }>({
	name: "beat-mapper-state",
	version: 3,
	async upgrade(idb, current, next, tx) {
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		const prefix = STORAGE_PREFIX.length > 0 ? `${STORAGE_PREFIX}:` : "";

		if (next && next >= 3) {
			await idb.createStore("songs", tx);
			await idb.createStore("grids", tx);
			const value = (await idb.get("keyvaluepairs", import.meta.env.DEV ? "redux-state-dev" : "redux-state", tx)) as string;
			if (value) {
				const snapshot = typeof value === "string" ? JSON.parse(value) : value;
				const username = selectUsername(snapshot);
				localStorage.setItem(`${prefix}user.new`, String(selectNew(snapshot)));
				if (username) localStorage.setItem(`${prefix}user.username`, username);
				localStorage.setItem(`${prefix}user.announcements`, selectAnnouncements(snapshot).toString());
				localStorage.setItem(`${prefix}audio.offset`, selectAudioProcessingDelay(snapshot).toString());
				for (const [id, song] of Object.entries<any>(snapshot.songs.byId)) {
					await idb.set(
						"songs",
						id.toString(),
						{
							...song,
							environment: patchEnvironmentName(song.environment),
							songFilename: song.songFilename.replace("_", "."),
							coverArtFilename: song.coverArtFilename.replace("_", "."),
							colorSchemesById: {},
							difficultiesById: Object.entries<any>(song.difficultiesById).reduce(
								(acc, [id, beatmap]) => {
									const bid = id.toString() ?? beatmap.id.toString();
									acc[bid] = {
										...omit<Record<string, unknown>, string>(beatmap, ["id"]),
										lightshowId: "Common",
										characteristic: "Standard",
										difficulty: resolveDifficultyFromBeatmapId(bid),
										environmentName: patchEnvironmentName(song.environment),
										colorSchemeName: null,
										mappers: song.mapAuthorName ? song.mapAuthorName.split(", ") : [],
										lighters: [],
										customLabel: beatmap.customLabel !== "" ? beatmap.customLabel : undefined,
									};
									return acc;
								},
								{} as Record<string, unknown>,
							),
						},
						tx,
					);
				}
				for (const [id, grid] of Object.entries(snapshot.editor.notes.gridPresets)) {
					await idb.set("grids", id.toString(), grid, tx);
				}
			}
			await idb.removeStore("keyvaluepairs", tx);
		}
	},
});

export async function createAppStore() {
	const middleware = createAllSharedMiddleware({
		filestore: filestore,
		autosaveWorker: autosaveWorker,
	});

	const userMiddleware = createStorageMiddleware<RootState, UserStorageObservers>({
		namespace: "user",
		storage: createStorage({ driver: ls({ base: STORAGE_PREFIX }) }),
		observers: {
			"user.new": { selector: selectNew },
			"user.announcements": { selector: selectAnnouncements },
			"user.username": { selector: (state) => selectUsername(state) ?? "" },
			"audio.offset": { selector: selectAudioProcessingDelay },
			"graphics.scale": { selector: selectRenderScale },
			"graphics.bloom": { selector: selectBloomEnabled },
			"advanced.wait": { selector: selectPacerWait },
		},
	});
	const sessionMiddleware = createStorageMiddleware<RootState, SessionStorageObservers>({
		namespace: "session",
		storage: createStorage({ driver: ss({ base: STORAGE_PREFIX }) }),
		observers: {
			"track.snap": { selector: selectSnap },
			"track.spacing": { selector: selectBeatDepth },
			"playback.rate": { selector: selectPlaybackRate },
			"playback.volume": { selector: selectSongVolume },
			"tick.volume": { selector: selectTickVolume },
			"tick.type": { selector: selectTickType },
			"notes.tool": { selector: (state) => Object.values(ObjectTool).indexOf(selectNotesEditorTool(state)) },
			"notes.direction": { selector: selectNotesEditorDirection },
			"notes.duration": { selector: selectDefaultObstacleDuration },
			"events.mode": { selector: (state) => Object.values(EventEditMode).indexOf(selectEventsEditorEditMode(state)) },
			"events.tool": { selector: (state) => Object.values(EventTool).indexOf(selectEventsEditorTool(state)) },
			"events.color": { selector: (state) => Object.values(EventColor).indexOf(selectEventsEditorColor(state)) },
			"events.zoom": { selector: selectEventsEditorZoomLevel },
			"events.opacity": { selector: selectEventsEditorTrackOpacity },
			"events.height": { selector: selectEventsEditorTrackHeight },
			"events.preview": { selector: selectEventsEditorPreview },
			"events.loop": { selector: selectEventsEditorWindowLock },
			"events.mirror": { selector: selectEventsEditorMirrorLock },
		},
	});
	const songStorageMiddleware = createEntityStorageMiddleware<RootState, App.ISong>({
		namespace: "songs",
		storage: createStorage({ driver: driver({ name: "songs" }) }),
		observer: {
			keys: (state) => selectSongIds(state).map((x) => x.toString()),
			selector: selectSongById,
			asRaw: true,
		},
	});
	const gridStorageMiddleware = createEntityStorageMiddleware<RootState, Member<IGridPresets>>({
		namespace: "grids",
		storage: createStorage({ driver: driver({ name: "grids" }) }),
		observer: {
			keys: selectAllGridPresetIds,
			selector: selectGridPresetById,
			asRaw: true,
		},
	});

	const devTools: DevToolsEnhancerOptions = {
		name: "Beatmapper",
		actionsDenylist: [tick.type, updateEventsEditorCursor.type],
	};

	const store = configureStore({
		reducer: root.reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (native) => native({ serializableCheck: false, immutableCheck: false }).concat(...middleware, userMiddleware, sessionMiddleware, songStorageMiddleware, gridStorageMiddleware),
		enhancers: (native) => native(),
	});

	await Promise.all([
		store.dispatch(loadUser()),
		store.dispatch(loadSession()),
		store.dispatch(loadSongs()),
		store.dispatch(loadGridPresets()),
		//
	]).then(() => {
		store.dispatch(init());
	});

	initStateWithPrevTab(store);

	return store;
}

export type RootState = ReturnType<typeof root.reducer>;
export type AppDispatch = Awaited<ReturnType<typeof createAppStore>>["dispatch"];
