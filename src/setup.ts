import { typeByExtension } from "@std/media-types/type-by-extension";
import { extname } from "@std/path/extname";
import { toPascalCase } from "@std/text/to-pascal-case";
import { createBeatmap, loadDifficulty, loadInfo } from "bsmap";
import { createStorage, type StorageValue } from "unstorage";

import { BeatmapFilestore } from "./services/file.service";
import { createDriver, type LegacyStorageSchema } from "./services/storage.service";
import { createAppStore } from "./store/setup";
import type { App } from "./types";
import { createAutosaveWorker } from "./workers";

export const driver = createDriver<LegacyStorageSchema & { entries: { key: string; value: StorageValue } }>({
	name: "beat-mapper-files",
	version: 4,
	async upgrade(idb, _current, next, tx) {
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		if (next && next >= 3) {
			await idb.createStore("entries", tx);
			function rewriteKey(key: string) {
				const [sid, filename] = key.split("_");
				if (filename === "Info.dat") return `${sid}.info`;
				const extension = extname(filename);
				if (extension === ".ogg" || extension === ".egg") return `${sid}.song`;
				if (extension === ".jpg" || extension === ".jpeg" || extension === ".png") return `${sid}.cover`;
				const bid = filename.split(".").slice(0, -1).join(".");
				return `${sid}.${bid}.beatmap`;
			}
			function rewriteValue(value: unknown, key: string) {
				const [_, filename] = key.split("_");
				if (filename === "Info.dat") {
					return loadInfo(JSON.parse(value as string));
				}
				const extension = extname(filename);
				if (extension === ".dat") {
					const [bid] = filename.split(".");
					return loadDifficulty(JSON.parse(value as string), {
						postprocess: [(data) => createBeatmap({ ...data, filename: `${bid}.beatmap.dat`, lightshowFilename: "Common.lightshow.dat" })],
					});
				}
				if (typeof value === "string") return JSON.parse(value);
				if (value instanceof Blob) {
					let type = typeByExtension(extension);
					if (extension === ".egg") type = "audio/ogg";
					return new File([value], filename, { type: type ?? "application/octet-stream" });
				}
				return value;
			}
			const keys = await idb.keys("keyvaluepairs", tx);
			for (const key of keys) {
				const value = await idb.get("keyvaluepairs", key, tx);
				await idb.set("entries", rewriteKey(key), rewriteValue(value, key), tx);
			}
			await idb.removeStore("keyvaluepairs", tx);
		}
		if (next && next >= 4) {
			const keys = await idb.keys("entries", tx);
			await Promise.all([
				keys.forEach(async (key) => {
					const sid = key.split(".")[0];
					if (sid === toPascalCase(sid)) return;
					const current = (await idb.get("entries", key, tx)) as App.ISong;
					await idb.set("entries", key.replace(sid, toPascalCase(sid)), current, tx);
					await idb.delete("entries", key, tx);
				}),
			]);
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
