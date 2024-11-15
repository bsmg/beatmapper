import { createStorage } from "unstorage";

import { BeatmapFilestore } from "./services/file.service";
import { type LegacyStorageSchema, createDriver } from "./services/storage.service";
import { createAutosaveWorker } from "./workers";

export const driver = createDriver<LegacyStorageSchema>({
	name: "beat-mapper-files",
	version: 3,
	async upgrade(idb, current, next, tx) {
		await idb.createStore("keyvaluepairs", tx);
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		if (next && next >= 3) {
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
				await idb.set("keyvaluepairs", rewriteKey(key), rewriteValue(value), tx);
				await idb.delete("keyvaluepairs", key, tx);
			}
		}
	},
});

export const filestore = new BeatmapFilestore({
	storage: createStorage({
		driver: driver({ name: "keyvaluepairs" }),
	}),
});

// Saving is a significantly expensive operation, and it's one that is done very often, so it makes sense to do it in a web worker.
export const autosaveWorker = createAutosaveWorker({ filestore: filestore });
