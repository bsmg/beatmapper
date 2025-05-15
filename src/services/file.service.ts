import type { wrapper } from "bsmap/types";
import type { Storage, StorageValue } from "unstorage";

import { defaultCoverArtPath } from "$/assets";
import type { BeatmapId, MaybeDefined, SongId } from "$/types";
import { omit, pick } from "$/utils";
import { createAudioData, createBeatmap, createDifficulty, createInfo, createLightshow } from "bsmap";

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

type BeatmapFileType = "info" | "song" | "cover" | "beatmap" | "audio";
type BeatmapFileOptions<T extends BeatmapFileType> = T extends "beatmap" ? { id: BeatmapId } : Record<string, unknown>;

export class BeatmapFilestore extends Filestore {
	static resolveFilename<T extends BeatmapFileType>(songId: SongId, type: T, options: BeatmapFileOptions<T>) {
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
		return this.loadFile<File>(filename);
	}
	async loadCoverArtFile(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", {});
		return this.loadFile<File>(filename);
	}
	async loadInfoContents(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.loadFile<wrapper.IWrapInfo>(filename);
	}
	async loadAudioDataContents(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "audio", {});
		return this.loadFile<wrapper.IWrapAudioData>(filename);
	}
	async loadBeatmapContents(songId: SongId, beatmapId: BeatmapId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.loadFile<wrapper.IWrapBeatmap>(filename);
	}
	async loadImplicitVersion(songId: SongId, beatmapId: BeatmapId) {
		const beatmap = await this.loadBeatmapContents(songId, beatmapId);
		return beatmap.version as 1 | 2 | 3 | 4;
	}

	async saveSongFile<T extends File>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "song", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveCoverFile<T extends File>(songId: SongId, contents: T) {
		if (!contents) return this.saveBackupCoverFile();
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveInfoContents<T extends wrapper.IWrapInfo>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveAudioDataContents<T extends wrapper.IWrapAudioData>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "audio", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveBeatmapContents<T extends wrapper.IWrapBeatmap>(songId: SongId, beatmapId: BeatmapId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId });
		return this.saveFile<T>(filename, contents);
	}

	async updateInfoContents(songId: SongId, newContents: Partial<wrapper.IWrapInfo>) {
		const savedContents = await this.loadInfoContents(songId).catch(() => createInfo({ ...newContents }));
		return await this.saveInfoContents(
			songId,
			createInfo({
				...(savedContents ?? newContents),
				...omit(newContents, "version", "filename"),
			}),
		);
	}
	async updateAudioContents(songId: SongId, newContents: Partial<wrapper.IWrapAudioData>) {
		const savedContents = await this.loadAudioDataContents(songId);
		return await this.saveAudioDataContents(
			songId,
			createAudioData({
				...(savedContents ?? newContents),
				...omit(newContents, "version", "filename"),
			}),
		);
	}
	async updateBeatmapContents(songId: SongId, beatmapId: BeatmapId, newContents: Partial<wrapper.IWrapBeatmap>) {
		const savedContents = await this.loadBeatmapContents(songId, beatmapId).catch(() => createBeatmap({ ...newContents }));
		return await this.saveBeatmapContents(
			songId,
			beatmapId,
			createBeatmap({
				...(savedContents ?? newContents),
				// we might have an updated lightshow filename if we update the lightshow id.
				lightshowFilename: newContents.lightshowFilename ?? savedContents.lightshowFilename,
				difficulty: createDifficulty({
					// for difficulty, we'll remove all unsupported collections since those objects shouldn't exist anyway.
					...pick(savedContents.difficulty, "colorNotes", "bombNotes", "obstacles"),
					...newContents.difficulty,
				}),
				lightshow: createLightshow({
					// for lightshow, we'll merge the contents and only replace collections that are directly supported.
					...savedContents.lightshow,
					...newContents.lightshow,
				}),
			}),
		);
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
