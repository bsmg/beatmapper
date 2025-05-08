import { createBeatmap, loadDifficulty, loadInfo } from "bsmap";
import { type StorageValue, createStorage } from "unstorage";

import { BeatmapFilestore } from "./services/file.service";
import { type LegacyStorageSchema, createDriver } from "./services/storage.service";
import { createAppStore } from "./store/setup";
import { createAutosaveWorker } from "./workers";

export const driver = createDriver<LegacyStorageSchema & { entries: { key: string; value: StorageValue } }>({
	name: "beat-mapper-files",
	version: 3,
	async upgrade(idb, current, next, tx) {
		if (current !== 0) {
			window.alert(`The local database has been updated to version ${next}. Please refresh the page to ensure these migrations can be properly applied.`);
		}

		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		if (next && next >= 3) {
			await idb.createStore("entries", tx);
			function rewriteKey(key: string) {
				const [sid, filename] = key.split("_");
				if (filename.endsWith(".ogg")) return `${sid}.song`;
				if (filename.endsWith(".jpg")) return `${sid}.cover`;
				if (filename === "Info.dat") return `${sid}.info`;
				const bid = filename.split(".").slice(0, -1).join(".");
				return `${sid}.${bid}.beatmap`;
			}
			function rewriteValue(value: unknown, key: string) {
				const [_, filename] = key.split("_");
				if (filename === "Info.dat") {
					return loadInfo(JSON.parse(value as string));
				}
				if (filename.endsWith(".dat")) {
					const [bid] = filename.split(".");
					return loadDifficulty(JSON.parse(value as string), {
						postprocess: [(data) => createBeatmap({ ...data, filename: `${bid}.beatmap.dat` })],
					});
				}
				if (typeof value === "string") return JSON.parse(value);
				if (value instanceof Blob) return new Blob([value], { type: "application/octet-stream" });
				return value;
			}
			const keys = await idb.keys("keyvaluepairs", tx);
			for (const key of keys) {
				const value = await idb.get("keyvaluepairs", key, tx);
				await idb.set("entries", rewriteKey(key), rewriteValue(value, key), tx);
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
