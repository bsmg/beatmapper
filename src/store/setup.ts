import { type DevToolsEnhancerOptions, configureStore } from "@reduxjs/toolkit";
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
	getAllGridPresetIds,
	getAllSongIds,
	getAreLasersLocked,
	getBackgroundOpacity,
	getBeatDepth,
	getDefaultObstacleDuration,
	getGraphicsLevel,
	getGridPresetById,
	getIsLockedToCurrentWindow,
	getIsNewUser,
	getPlayNoteTick,
	getPlaybackRate,
	getProcessingDelay,
	getRowHeight,
	getSeenPrompts,
	getSelectedCutDirection,
	getSelectedEventColor,
	getSelectedEventEditMode,
	getSelectedEventTool,
	getSelectedNoteTool,
	getShowLightingPreview,
	getSnapTo,
	getSongById,
	getStickyMapAuthorName,
	getVolume,
	getZoomLevel,
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
	"notes.direction": StorageObserver<RootState, number>;
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
				const username = getStickyMapAuthorName(snapshot);
				localStorage.setItem("beatmapper:user.new", String(getIsNewUser(snapshot)));
				if (username) localStorage.setItem("beatmapper:user.username", username);
				localStorage.setItem("beatmapper:user.announcements", getSeenPrompts(snapshot).toString());
				localStorage.setItem("beatmapper:audio.offset", getProcessingDelay(snapshot).toString());
				localStorage.setItem("beatmapper:graphics.quality", Object.values(Quality).indexOf(getGraphicsLevel(snapshot)).toString());
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
			"user.new": { selector: getIsNewUser },
			"user.username": { selector: (state) => getStickyMapAuthorName(state) ?? "" },
			"user.announcements": { selector: getSeenPrompts },
			"audio.offset": { selector: getProcessingDelay },
			"graphics.quality": { selector: (state) => Object.values(Quality).indexOf(getGraphicsLevel(state)) },
		},
	});
	const sessionMiddleware = createStorageMiddleware<RootState, SessionStorageObservers>({
		namespace: "session",
		storage: createStorage({ driver: ss({ base: storagePrefix }) }),
		observers: {
			"track.snap": { selector: getSnapTo },
			"track.spacing": { selector: getBeatDepth },
			"playback.rate": { selector: getPlaybackRate },
			"playback.volume": { selector: getVolume },
			"playback.tick": { selector: getPlayNoteTick },
			"notes.tool": { selector: (state) => Object.values(ObjectTool).indexOf(getSelectedNoteTool(state)) },
			"notes.direction": { selector: getSelectedCutDirection },
			"notes.duration": { selector: getDefaultObstacleDuration },
			"events.mode": { selector: (state) => Object.values(EventEditMode).indexOf(getSelectedEventEditMode(state)) },
			"events.tool": { selector: (state) => Object.values(EventTool).indexOf(getSelectedEventTool(state)) },
			"events.color": { selector: (state) => Object.values(EventColor).indexOf(getSelectedEventColor(state)) },
			"events.zoom": { selector: getZoomLevel },
			"events.opacity": { selector: getBackgroundOpacity },
			"events.height": { selector: getRowHeight },
			"events.preview": { selector: getShowLightingPreview },
			"events.loop": { selector: getIsLockedToCurrentWindow },
			"events.mirror": { selector: getAreLasersLocked },
		},
	});
	const songStorageMiddleware = createEntityStorageMiddleware<RootState, App.Song>({
		namespace: "songs",
		storage: createStorage({ driver: driver({ name: "songs" }) }),
		observer: {
			keys: getAllSongIds,
			selector: getSongById,
			asRaw: true,
		},
	});
	const gridStorageMiddleware = createEntityStorageMiddleware<RootState, Member<GridPresets>>({
		namespace: "grids",
		storage: createStorage({ driver: driver({ name: "grids" }) }),
		observer: {
			keys: getAllGridPresetIds,
			selector: getGridPresetById,
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
