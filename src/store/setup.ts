import { type DevToolsEnhancerOptions, configureStore } from "@reduxjs/toolkit";
import { createStorage } from "unstorage";

import { type LegacyStorageSchema, createDriver } from "$/services/storage.service";
import { autosaveWorker, filestore } from "$/setup";
import type { App, SongId } from "$/types";

import { moveMouseAcrossEventsGrid, tick } from "./actions";
import { createStorageEngine, storageEnhancer } from "./enhancers";
import { default as root } from "./features";
import { createAllSharedMiddleware } from "./middleware";

const key = import.meta.env.DEV ? "redux-state-dev" : "redux-state";

type Snapshot = Pick<RootState, "user" | "editor"> & { songs: Pick<RootState["songs"], "byId">; navigation: Pick<RootState["navigation"], "snapTo" | "beatDepth" | "volume" | "playNoteTick"> };

const driver = createDriver<LegacyStorageSchema>({
	name: "beat-mapper-state",
	version: 3,
	async upgrade(idb, current, next, tx) {
		await idb.createStore("keyvaluepairs", tx);
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		if (next && next >= 3) {
			function rewrite(value: unknown) {
				const snapshot = typeof value === "string" ? JSON.parse(value) : value;
				const { songs } = snapshot as Snapshot;
				const allSongs = Object.values(songs.byId).reduce(
					(acc, song) => {
						acc[song.id] = {
							...song,
							songFilename: song.songFilename.replace("_", "."),
							coverArtFilename: song.coverArtFilename.replace("_", "."),
						};
						return acc;
					},
					{} as Record<SongId, App.Song>,
				);
				return { ...snapshot, songs: { byId: allSongs } };
			}
			await idb.update("keyvaluepairs", key, (value) => rewrite(value), tx);
		}
	},
});

export function createAppStore() {
	const engine = createStorageEngine({
		key: key,
		storage: createStorage({ driver: driver({ name: "keyvaluepairs" }) }),
		debounceTime: 250,
		whitelist: ["user", "editor", ["songs", "byId"], ["navigation", "snapTo"], ["navigation", "beatDepth"], ["navigation", "volume"], ["navigation", "playNoteTick"]],
	});

	const middleware = createAllSharedMiddleware({
		filestore: filestore,
		autosaveWorker: autosaveWorker,
		reduxStorageEngine: engine,
	});

	const devTools: DevToolsEnhancerOptions = {
		actionsDenylist: [tick.type, moveMouseAcrossEventsGrid.type],
	};

	const store = configureStore({
		reducer: root.reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (native) => native({ serializableCheck: false, immutableCheck: false }).concat(...middleware),
		enhancers: (native) => native().concat(storageEnhancer(engine)),
	});

	return store;
}

export type RootState = ReturnType<typeof root.reducer>;
export type AppDispatch = ReturnType<typeof createAppStore>["dispatch"];
