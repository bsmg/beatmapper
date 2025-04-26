import { type DevToolsEnhancerOptions, configureStore } from "@reduxjs/toolkit";
import type { NoteDirection } from "bsmap";
import { createStorage } from "unstorage";
import { default as ls } from "unstorage/drivers/localstorage";
import { default as ss } from "unstorage/drivers/session-storage";

import { type LegacyStorageSchema, createDriver } from "$/services/storage.service";
import { autosaveWorker, filestore } from "$/setup";
import { type App, EventColor, EventEditMode, EventTool, type GridPresets, type Member, ObjectTool, Quality } from "$/types";

import { init, loadGridPresets, loadSession, loadSongs, loadUser, moveMouseAcrossEventsGrid, tick } from "./actions";
import { default as root } from "./features";
import type { Snapshot } from "./helpers";
import { type StorageObserver, createAllSharedMiddleware, createStorageMiddleware } from "./middleware";
import { createEntityStorageMiddleware } from "./middleware/storage.middleware";
import {
	selectAllGridPresetIds,
	selectAudioProcessingDelay,
	selectBeatDepth,
	selectDefaultObstacleDuration,
	selectEventBackgroundOpacity,
	selectEventEditorColor,
	selectEventEditorEditMode,
	selectEventEditorRowHeight,
	selectEventEditorToggleLoop,
	selectEventEditorToggleMirror,
	selectEventEditorTogglePreview,
	selectEventEditorTool,
	selectEventEditorZoomLevel,
	selectGraphicsQuality,
	selectGridPresetById,
	selectIsNew,
	selectNoteEditorDirection,
	selectNoteEditorTool,
	selectPlayNoteTick,
	selectPlaybackRate,
	selectSeenPrompts,
	selectSnapTo,
	selectSongById,
	selectSongIds,
	selectUserName,
	selectVolume,
} from "./selectors";

export type UserStorageObservers = {
	"user.new": StorageObserver<RootState, boolean>;
	"user.username": StorageObserver<RootState, string>;
	"user.announcements": StorageObserver<RootState, string[]>;
	"audio.offset": StorageObserver<RootState, number>;
	"graphics.quality": StorageObserver<RootState, number>;
};
export type SessionStorageObservers = {
	"track.snap": StorageObserver<RootState, number>;
	"track.spacing": StorageObserver<RootState, number>;
	"playback.rate": StorageObserver<RootState, number>;
	"playback.volume": StorageObserver<RootState, number>;
	"playback.tick": StorageObserver<RootState, boolean>;
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

const driver = createDriver<LegacyStorageSchema & { songs: { key: string; value: App.Song }; grids: { key: keyof GridPresets; value: Member<GridPresets> } }>({
	name: "beat-mapper-state",
	version: 3,
	async upgrade(idb, current, next, tx) {
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		if (next && next >= 3) {
			await idb.createStore("songs", tx);
			await idb.createStore("grids", tx);
			const value = (await idb.get("keyvaluepairs", import.meta.env.DEV ? "redux-state-dev" : "redux-state", tx)) as string;
			if (value) {
				const snapshot = (typeof value === "string" ? JSON.parse(value) : value) as Snapshot;
				const username = selectUserName(snapshot);
				localStorage.setItem("beatmapper:user.new", String(selectIsNew(snapshot)));
				if (username) localStorage.setItem("beatmapper:user.username", username);
				localStorage.setItem("beatmapper:user.announcements", selectSeenPrompts(snapshot).toString());
				localStorage.setItem("beatmapper:audio.offset", selectAudioProcessingDelay(snapshot).toString());
				localStorage.setItem("beatmapper:graphics.quality", Object.values(Quality).indexOf(selectGraphicsQuality(snapshot)).toString());
				for (const [id, song] of Object.entries(snapshot.songs.byId)) {
					await idb.set("songs", id, { ...song, songFilename: song.songFilename.replace("_", "."), coverArtFilename: song.coverArtFilename.replace("_", ".") }, tx);
				}
				for (const [id, grid] of Object.entries(snapshot.editor.notes.gridPresets)) {
					await idb.set("grids", id, grid, tx);
				}
			}
			await idb.removeStore("keyvaluepairs", tx);
		}
	},
});

export async function createAppStore() {
	const storagePrefix = location.hostname === "localhost" ? "beatmapper" : "";

	const middleware = createAllSharedMiddleware({
		filestore: filestore,
		autosaveWorker: autosaveWorker,
	});

	const userMiddleware = createStorageMiddleware<RootState, UserStorageObservers>({
		namespace: "user",
		storage: createStorage({ driver: ls({ base: storagePrefix }) }),
		observers: {
			"user.new": { selector: selectIsNew },
			"user.username": { selector: (state) => selectUserName(state) ?? "" },
			"user.announcements": { selector: selectSeenPrompts },
			"audio.offset": { selector: selectAudioProcessingDelay },
			"graphics.quality": { selector: (state) => Object.values(Quality).indexOf(selectGraphicsQuality(state)) },
		},
	});
	const sessionMiddleware = createStorageMiddleware<RootState, SessionStorageObservers>({
		namespace: "session",
		storage: createStorage({ driver: ss({ base: storagePrefix }) }),
		observers: {
			"track.snap": { selector: selectSnapTo },
			"track.spacing": { selector: selectBeatDepth },
			"playback.rate": { selector: selectPlaybackRate },
			"playback.volume": { selector: selectVolume },
			"playback.tick": { selector: selectPlayNoteTick },
			"notes.tool": { selector: (state) => Object.values(ObjectTool).indexOf(selectNoteEditorTool(state)) },
			"notes.direction": { selector: selectNoteEditorDirection },
			"notes.duration": { selector: selectDefaultObstacleDuration },
			"events.mode": { selector: (state) => Object.values(EventEditMode).indexOf(selectEventEditorEditMode(state)) },
			"events.tool": { selector: (state) => Object.values(EventTool).indexOf(selectEventEditorTool(state)) },
			"events.color": { selector: (state) => Object.values(EventColor).indexOf(selectEventEditorColor(state)) },
			"events.zoom": { selector: selectEventEditorZoomLevel },
			"events.opacity": { selector: selectEventBackgroundOpacity },
			"events.height": { selector: selectEventEditorRowHeight },
			"events.preview": { selector: selectEventEditorTogglePreview },
			"events.loop": { selector: selectEventEditorToggleLoop },
			"events.mirror": { selector: selectEventEditorToggleMirror },
		},
	});
	const songStorageMiddleware = createEntityStorageMiddleware<RootState, App.Song>({
		namespace: "songs",
		storage: createStorage({ driver: driver({ name: "songs" }) }),
		observer: {
			keys: (state) => selectSongIds(state).map((x) => x.toString()),
			selector: selectSongById,
			asRaw: true,
		},
	});
	const gridStorageMiddleware = createEntityStorageMiddleware<RootState, Member<GridPresets>>({
		namespace: "grids",
		storage: createStorage({ driver: driver({ name: "grids" }) }),
		observer: {
			keys: selectAllGridPresetIds,
			selector: selectGridPresetById,
			asRaw: true,
		},
	});

	const devTools: DevToolsEnhancerOptions = {
		actionsDenylist: [tick.type, moveMouseAcrossEventsGrid.type],
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

	return store;
}

export type RootState = ReturnType<typeof root.reducer>;
export type AppDispatch = Awaited<ReturnType<typeof createAppStore>>["dispatch"];
