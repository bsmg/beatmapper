import { type StorageValue, createStorage } from "unstorage";

import { BeatmapFilestore } from "./services/file.service";
import { type LegacyStorageSchema, createDriver } from "./services/storage.service";
import { createAppStore } from "./store/setup";
import { createAutosaveWorker } from "./workers";

export const driver = createDriver<LegacyStorageSchema & { entries: { key: string; value: StorageValue } }>({
	name: "beat-mapper-files",
	version: 3,
	async upgrade(idb, current, next, tx) {
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		if (next && next >= 3) {
			await idb.createStore("entries", tx);
			function rewriteKey(key: string) {
				let newKey = key;
				if (key.endsWith(".dat") && !key.endsWith("Info.dat")) newKey = key.replace(".dat", ".beatmap.dat");
				return newKey.replaceAll("_", ".");
			}
			function rewriteValue(value: unknown) {
				if (typeof value === "string") return JSON.parse(value);
				if (value instanceof Blob) return new Blob([value], { type: "application/octet-stream" });
				return value;
			}
			const keys = await idb.keys("keyvaluepairs", tx);
			for (const key of keys) {
				const value = await idb.get("keyvaluepairs", key, tx);
				await idb.set("entries", rewriteKey(key), rewriteValue(value), tx);
			}
			await idb.removeStore("keyvaluepairs", tx);
		}
	},
});

export const filestore = new BeatmapFilestore({
	storage: createStorage({
		driver: driver({ name: "entries" }),
	}),
});

// Saving is a significantly expensive operation, and it's one that is done very often, so it makes sense to do it in a web worker.
export const autosaveWorker = createAutosaveWorker({ filestore: filestore });

export const store = await createAppStore();
