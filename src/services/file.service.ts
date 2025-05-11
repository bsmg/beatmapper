import type { wrapper } from "bsmap/types";
import type { Storage, StorageValue } from "unstorage";

import { defaultCoverArtPath } from "$/assets";
import { resolveExtension } from "$/helpers/file.helpers";
import { type BeatmapDeserializationOptions, type BeatmapSerializationOptions, type InfoDeserializationOptions, type InfoSerializationOptions, deserializeBeatmapContents, deserializeInfoContents, serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import type { App, BeatmapId, MaybeDefined, SongId } from "$/types";
import { deepMerge, omit } from "$/utils";

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

type BeatmapFileType = "info" | "song" | "cover" | "beatmap";
type BeatmapFileOptions<T extends BeatmapFileType> = T extends "beatmap" ? { id: BeatmapId } : Record<string, unknown>;

export class BeatmapFilestore extends Filestore {
	static resolveFilename<T extends BeatmapFileType>(songId: SongId, type: T, options: BeatmapFileOptions<T>) {
		switch (type) {
			case "song":
			case "cover":
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

	private async saveBackupCoverFile() {
		// If the user doesn't have a cover image yet, we'll supply a default.
		// Ideally we'd need a File, to be consistent with the File we get from a locally-selected file, but a Blob is near-identical. If it looks like a duck, etc.
		const pathPieces = defaultCoverArtPath.split("/");
		const coverArtFilename = pathPieces[pathPieces.length - 1];
		// I should first check and see if the user has already saved this placeholder, so that I can skip overwriting it.
		if (await this.storage.hasItem(coverArtFilename)) {
			const file = this.loadFile<File>(coverArtFilename);
			return { filename: coverArtFilename, contents: file };
		}
		// I need to convert the file URL I have into a Blob, and then save that to indexedDB.
		const res = await window.fetch(defaultCoverArtPath);
		const blob = await res.blob();
		return await this.saveFile(coverArtFilename, blob);
	}

	async loadSongFile(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "song", {});
		return this.loadFile<Blob>(filename);
	}
	async loadCoverArtFile(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", {});
		return this.loadFile<Blob>(filename);
	}
	async loadInfo(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.loadFile<wrapper.IWrapInfo>(filename);
	}
	async loadBeatmap(songId: SongId, beatmapId: BeatmapId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.loadFile<wrapper.IWrapBeatmap>(filename);
	}

	async saveSongFile<T extends File | Blob>(songId: SongId, contents: T, type?: string, overrideFilename?: string) {
		const implicitType = contents.type.length >= 1 ? contents.type : (type ?? "application/octet-stream");
		const extension = resolveExtension(implicitType, contents instanceof File ? contents.name : overrideFilename);
		const filename = BeatmapFilestore.resolveFilename(songId, "song", { extension });
		return this.saveFile<T>(filename, new Blob([contents], { type: implicitType }) as T);
	}
	async saveCoverFile<T extends File | Blob>(songId: SongId, contents?: T, type?: string, overrideFilename?: string) {
		if (!contents) return this.saveBackupCoverFile();
		const implicitType = contents.type.length >= 1 ? contents.type : (type ?? "application/octet-stream");
		const extension = resolveExtension(implicitType, contents instanceof File ? contents.name : overrideFilename);
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", { extension });
		return this.saveFile<T>(filename, new Blob([contents], { type: implicitType }) as T);
	}
	async saveInfo<T extends wrapper.IWrapInfo>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveBeatmap<T extends wrapper.IWrapBeatmap>(songId: SongId, beatmapId: BeatmapId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.saveFile<T>(filename, contents);
	}

	async updateInfoContents(songId: SongId, contents: App.Song, options: { serializationOptions: InfoSerializationOptions; deserializationOptions: InfoDeserializationOptions }) {
		const savedContents = await this.loadInfo(songId);
		const currentContents = deserializeInfoContents(savedContents, options.deserializationOptions);
		const newContents = serializeInfoContents(deepMerge({ ...currentContents, ...contents }), options.serializationOptions);
		await this.saveInfo(songId, {
			...newContents,
			version: savedContents.version,
			filename: savedContents.filename,
		});
	}
	async updateBeatmapContents(songId: SongId, beatmapId: BeatmapId, contents: Partial<App.BeatmapEntities>, options: { serializationOptions: BeatmapSerializationOptions; deserializationOptions: BeatmapDeserializationOptions }) {
		const savedContents = await this.loadBeatmap(songId, beatmapId);
		const currentContents = deserializeBeatmapContents(savedContents, options.deserializationOptions);
		const newContents = serializeBeatmapContents(deepMerge({ ...currentContents, ...contents }), options.serializationOptions);
		await this.saveBeatmap(songId, beatmapId, {
			version: savedContents.version,
			filename: savedContents.filename,
			lightshowFilename: savedContents.lightshowFilename,
			// for difficulty, we'll replace all collections since we can't interact with unsupported objects anyway.
			difficulty: newContents.difficulty,
			// for lightshow, we'll merge the contents and only replace collections that are directly supported.
			lightshow: {
				...newContents.lightshow,
				...omit(savedContents.lightshow, "basicEvents"),
			},
			customData: savedContents.customData,
		});
	}

	async removeAllFilesForSong(songId: SongId, beatmapIds: BeatmapId[]) {
		return Promise.all([
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "info", {})),
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "song", {})),
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "cover", {})),
			...beatmapIds.map((id) => this.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: id }))),
			//
		]);
	}
}
