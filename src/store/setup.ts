import { type DevToolsEnhancerOptions, configureStore } from "@reduxjs/toolkit";
import { createStorage } from "unstorage";

import { type LegacyStorageSchema, createDriver } from "$/services/storage.service";
import { autosaveWorker, filestore } from "$/setup";
import type { App, SongId } from "$/types";

import { init, loadSnapshot, moveMouseAcrossEventsGrid, tick } from "./actions";
import { default as root } from "./features";
import { type Snapshot, selectSnapshot } from "./helpers";
import { type StorageObserver, createAllSharedMiddleware, createStorageMiddleware } from "./middleware";

export const SNAPSHOT_KEY = import.meta.env.DEV ? "redux-state-dev" : "redux-state";

export type SnapshotStorageObservers = {
	[Key in "redux-state-dev" | "redux-state"]: StorageObserver<RootState, Snapshot>;
};

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
			await idb.update("keyvaluepairs", SNAPSHOT_KEY, (value) => rewrite(value), tx);
		}
	},
});

export async function createAppStore() {
	const middleware = createAllSharedMiddleware({
		filestore: filestore,
		autosaveWorker: autosaveWorker,
	});

	const snapshotMiddleware = createStorageMiddleware<RootState, SnapshotStorageObservers>({
		namespace: "snapshot",
		storage: createStorage({ driver: driver({ name: "keyvaluepairs" }) }),
		observers: {
			"redux-state": {
				selector: selectSnapshot,
				condition: import.meta.env.PROD,
				asRaw: true,
			},
			"redux-state-dev": {
				selector: selectSnapshot,
				condition: import.meta.env.DEV,
				asRaw: true,
			},
		},
	});

	const devTools: DevToolsEnhancerOptions = {
		actionsDenylist: [tick.type, moveMouseAcrossEventsGrid.type],
	};

	const store = configureStore({
		reducer: root.reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (native) => native({ serializableCheck: false, immutableCheck: false }).concat(...middleware, snapshotMiddleware),
		enhancers: (native) => native(),
	});

	await Promise.all([
		store.dispatch(loadSnapshot()),
		//
	]).then(() => {
		store.dispatch(init());
	});

	return store;
}

export type RootState = ReturnType<typeof root.reducer>;
export type AppDispatch = Awaited<ReturnType<typeof createAppStore>>["dispatch"];
