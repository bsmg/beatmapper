import { omit } from "@std/collections/omit";
import { pick } from "@std/collections/pick";
import type { DeepPartial, InferBeatmapVersion } from "bsmap";
import { createAudioData, createBeatmap, createInfo, type IWrapAudioData, type IWrapBeatmap, type IWrapInfo, sortObjectFn } from "bsmap";
import type { Storage, StorageValue } from "unstorage";

import type { App, BeatmapId, MaybeDefined, SongId } from "$/types";
import { deepAssign, ensureArray, ensureObject } from "$/utils";

type Saveable = File | Blob | ArrayBuffer | StorageValue;

export interface FilestoreOptions {
	storage: Storage;
}
export class Filestore {
	storage: Storage;
	constructor({ storage }: FilestoreOptions) {
		this.storage = storage;
	}

	async loadFile<T>(filename: string) {
		const file = this.storage.getItemRaw<T>(filename);
		if (!file) throw new Error(`No file found for filename: ${filename}`);
		return file as T;
	}
	async saveFile<T extends Saveable>(filename: string, contents: T) {
		await this.storage.setItemRaw<T>(filename, contents as MaybeDefined<T>);
		return { filename, contents };
	}
	async removeFile(filename: string) {
		return this.storage.removeItem(filename);
	}
}

type BeatmapFileOptions<T> = T extends "beatmap" ? { id: BeatmapId } : Record<string, unknown>;

export class BeatmapFilestore extends Filestore {
	static resolveFilename<T extends "info" | "song" | "cover" | "beatmap" | "audio">(songId: SongId, type: T, options: BeatmapFileOptions<T>) {
		switch (type) {
			case "song":
			case "cover":
			case "audio":
			case "info": {
				return `${songId}.${type}`;
			}
			case "beatmap": {
				const { id } = options as BeatmapFileOptions<"info" | "beatmap">;
				if (!id) throw new Error(`Must supply an id for ${type}.`);
				return `${songId}.${id}.${type}`;
			}
			default: {
				throw new Error(`Unrecognized type: ${type}`);
			}
		}
	}

	async loadSongFile(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "song", {});
		return this.loadFile<File>(filename);
	}
	async loadCoverArtFile(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", {});
		return this.loadFile<File>(filename);
	}
	async loadInfoContents(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.loadFile<IWrapInfo>(filename);
	}
	async loadAudioDataContents(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "audio", {});
		return this.loadFile<IWrapAudioData>(filename);
	}
	async loadBeatmapContents(songId: SongId, beatmapId: BeatmapId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.loadFile<IWrapBeatmap>(filename);
	}
	async loadImplicitVersion(songId: SongId, beatmapId: BeatmapId) {
		const beatmap = await this.loadBeatmapContents(songId, beatmapId);
		return beatmap.version as InferBeatmapVersion;
	}

	async saveSongFile<T extends File>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "song", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveCoverArtFile<T extends File>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveInfoContents<T extends IWrapInfo>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveAudioDataContents<T extends IWrapAudioData>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "audio", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveBeatmapContents<T extends IWrapBeatmap>(songId: SongId, beatmapId: BeatmapId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.saveFile<T>(filename, {
			...contents,
			// for difficulty data, we should remove all unsupported collections since those objects can cause issues the user would be unable to fix.
			difficulty: pick({ ...contents.difficulty }, ["colorNotes", "bombNotes", "obstacles", "customData"]),
			// we can supply our own wrappers for editor-specific collections.
			customData: ensureObject({
				bookmarks: ensureArray<App.IBookmark>(contents.customData?.bookmarks ?? [])?.sort(sortObjectFn),
			}),
		});
	}

	async updateInfoContents(songId: SongId, newContents: DeepPartial<IWrapInfo>) {
		const savedContents = await this.loadInfoContents(songId).catch(() => createInfo({ ...newContents }));
		return await this.saveInfoContents(songId, createInfo(deepAssign(savedContents, omit(newContents, ["version", "filename"]))));
	}
	async updateAudioDataContents(songId: SongId, newContents: DeepPartial<IWrapAudioData>) {
		const savedContents = await this.loadAudioDataContents(songId).catch(() => createAudioData({ ...newContents }));
		return await this.saveAudioDataContents(songId, createAudioData(deepAssign(savedContents, omit(newContents, ["version", "filename"]))));
	}
	async updateBeatmapContents(songId: SongId, beatmapId: BeatmapId, newContents: DeepPartial<IWrapBeatmap>) {
		const savedContents = await this.loadBeatmapContents(songId, beatmapId).catch(() => createBeatmap({ ...newContents }));
		return await this.saveBeatmapContents(songId, beatmapId, createBeatmap(deepAssign(savedContents, omit(newContents, ["version", "filename"]))));
	}

	async removeAllFilesForSong(songId: SongId, beatmapIds: BeatmapId[]) {
		return Promise.all([
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "song", {})),
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "cover", {})),
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "info", {})),
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "audio", {})),
			...beatmapIds.map((id) => this.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: id }))),
			//
		]);
	}
}
