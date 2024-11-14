import { createStorage } from "unstorage";

import { type LegacyStorageSchema, createDriver } from "./services/storage.service";
import { createAutosaveWorker } from "./workers";

export const driver = createDriver<LegacyStorageSchema>({
	name: "beat-mapper-files",
	version: 2,
	async upgrade(idb, current, next, tx) {
		await idb.createStore("keyvaluepairs", tx);
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);
	},
});

export const filestore = createStorage({
	driver: driver({ name: "keyvaluepairs" }),
});

// Saving is a significantly expensive operation, and it's one that is done very often, so it makes sense to do it in a web worker.
export const autosaveWorker = createAutosaveWorker();
