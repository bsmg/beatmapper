import type { v2 } from "bsmap/types";
import type { Storage, StorageValue } from "unstorage";

import { defaultCoverArtPath } from "$/assets";
import { resolveExtension } from "$/helpers/file.helpers";
import type { BeatmapId, MaybeDefined, SongId } from "$/types";

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
		return this.storage.getItemRaw<T>(filename);
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
type BeatmapFileOptions<T extends BeatmapFileType> = T extends "song" | "cover" ? { extension: string } : T extends "beatmap" ? { id: BeatmapId } : Record<string, never>;
type BeatmapFileImplicitReturn<T extends BeatmapFileType> = T extends "song" | "cover" ? File | Blob : T extends "beatmap" ? v2.IDifficulty : Saveable;

export class BeatmapFilestore extends Filestore {
	static resolveFilename<T extends BeatmapFileType>(songId: SongId, type: T, options: BeatmapFileOptions<T>) {
		switch (type) {
			case "info": {
				return `${songId}.Info.dat`;
			}
			case "song":
			case "cover": {
				const { extension } = options as BeatmapFileOptions<"song" | "cover">;
				if (!extension) throw new Error(`Must supply a file extension for ${type}.`);
				return `${songId}.${type}.${extension}`;
			}
			case "beatmap": {
				const { id } = options as BeatmapFileOptions<"beatmap">;
				if (!id) throw new Error(`Must supply an id for ${type}.`);
				return `${songId}.${id}.${type}.dat`;
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
			if (!file) throw new Error("An unexpected error occured.");
			return { filename: coverArtFilename, contents: file };
		}
		// I need to convert the file URL I have into a Blob, and then save that to indexedDB.
		const res = await window.fetch(defaultCoverArtPath);
		const blob = await res.blob();
		return await this.saveFile(coverArtFilename, blob);
	}

	async loadBeatmapFile(songId: SongId, beatmapId: BeatmapId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.loadFile<BeatmapFileImplicitReturn<"beatmap">>(filename);
	}

	async saveInfoFile<T extends BeatmapFileImplicitReturn<"info">>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveSongFile<T extends BeatmapFileImplicitReturn<"song">>(songId: SongId, contents: T, type?: string, overrideFilename?: string) {
		const implicitType = contents.type.length >= 1 ? contents.type : (type ?? "application/octet-stream");
		const extension = resolveExtension(implicitType, contents instanceof File ? contents.name : overrideFilename);
		const filename = BeatmapFilestore.resolveFilename(songId, "song", { extension });
		return this.saveFile<T>(filename, new Blob([contents], { type: implicitType }) as T);
	}
	async saveCoverFile<T extends BeatmapFileImplicitReturn<"cover">>(songId: SongId, contents?: T, type?: string, overrideFilename?: string) {
		if (!contents) return this.saveBackupCoverFile();
		const implicitType = contents.type.length >= 1 ? contents.type : (type ?? "application/octet-stream");
		const extension = resolveExtension(implicitType, contents instanceof File ? contents.name : overrideFilename);
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", { extension });
		return this.saveFile<T>(filename, new Blob([contents], { type: implicitType }) as T);
	}
	async saveBeatmapFile<T extends BeatmapFileImplicitReturn<"beatmap">>(songId: SongId, beatmapId: BeatmapId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.saveFile<T>(filename, contents);
	}

	async removeAllFilesForSong(songId: SongId, songFilename: string, coverFilename: string, beatmapIds: BeatmapId[]) {
		return Promise.all([
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "info", {})),
			this.removeFile(songFilename),
			this.removeFile(coverFilename),
			...beatmapIds.map((id) => this.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: id }))),
			//
		]);
	}
}
