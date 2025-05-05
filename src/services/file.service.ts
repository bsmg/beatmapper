import type { InferBeatmapSerial } from "bsmap/types";
import type { Storage, StorageValue } from "unstorage";

import { defaultCoverArtPath } from "$/assets";
import { resolveExtension } from "$/helpers/file.helpers";
import {
	type InferBeatmapDeserializationOptions,
	type InferBeatmapSerializationOptions,
	type InferInfoDeserializationOptions,
	type InferInfoSerializationOptions,
	type PickBeatmapSerials,
	deserializeBeatmapContents,
	deserializeInfoContents,
	serializeBeatmapContents,
	serializeInfoContents,
} from "$/helpers/packaging.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import type { App, BeatmapId, MaybeDefined, SongId } from "$/types";
import { resolveImplicitVersion } from "./packaging.service.nitty-gritty";

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

type InfoImplicitVersion = Extract<ImplicitVersion, 1 | 2 | 4>;
type DifficultyImplicitVersion = Extract<ImplicitVersion, 1 | 2 | 3 | 4>;
type LightshowImplicitVersion = Extract<ImplicitVersion, 3 | 4>;

type BeatmapFileType = "info" | "song" | "cover" | "difficulty" | "lightshow";
type BeatmapFileOptions<T extends BeatmapFileType> = T extends "song" | "cover" ? { extension: string } : T extends "difficulty" | "lightshow" ? { id: BeatmapId; extension?: string } : Record<string, never>;
type InferBeatmapFile<T extends BeatmapFileType> = T extends "song" | "cover" ? File | Blob : T extends "difficulty" ? InferBeatmapSerial<"difficulty", DifficultyImplicitVersion> : T extends "lightshow" ? InferBeatmapSerial<"lightshow", LightshowImplicitVersion> : Saveable;

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
			case "lightshow":
			case "difficulty": {
				const { id, extension = "dat" } = options as BeatmapFileOptions<"difficulty" | "lightshow">;
				if (!id) throw new Error(`Must supply an id for ${type}.`);
				const typeForFilename = type === "difficulty" ? "beatmap" : type;
				return `${songId}.${id}.${typeForFilename}.${extension}`;
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

	async loadInfoFile<V extends InfoImplicitVersion>(songId: SongId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.loadFile<InferBeatmapSerial<"info", V>>(filename);
	}
	async loadBeatmapFile<V extends DifficultyImplicitVersion>(songId: SongId, beatmapId: BeatmapId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "difficulty", { id: beatmapId });
		return this.loadFile<InferBeatmapSerial<"difficulty", V>>(filename);
	}
	async loadLightshowFile<V extends LightshowImplicitVersion>(songId: SongId, lightshowId: BeatmapId) {
		const filename = BeatmapFilestore.resolveFilename(songId, "lightshow", { id: lightshowId });
		return this.loadFile<InferBeatmapSerial<"lightshow", V>>(filename);
	}

	async saveSongFile<T extends InferBeatmapFile<"song">>(songId: SongId, contents: T, type?: string, overrideFilename?: string) {
		const implicitType = contents.type.length >= 1 ? contents.type : (type ?? "application/octet-stream");
		const extension = resolveExtension(implicitType, contents instanceof File ? contents.name : overrideFilename);
		const filename = BeatmapFilestore.resolveFilename(songId, "song", { extension });
		return this.saveFile<T>(filename, new Blob([contents], { type: implicitType }) as T);
	}
	async saveCoverFile<T extends InferBeatmapFile<"cover">>(songId: SongId, contents?: T, type?: string, overrideFilename?: string) {
		if (!contents) return this.saveBackupCoverFile();
		const implicitType = contents.type.length >= 1 ? contents.type : (type ?? "application/octet-stream");
		const extension = resolveExtension(implicitType, contents instanceof File ? contents.name : overrideFilename);
		const filename = BeatmapFilestore.resolveFilename(songId, "cover", { extension });
		return this.saveFile<T>(filename, new Blob([contents], { type: implicitType }) as T);
	}
	async saveInfoFile<V extends InfoImplicitVersion, T extends InferBeatmapFile<"info"> = InferBeatmapSerial<"info", V>>(songId: SongId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "info", {});
		return this.saveFile<T>(filename, contents);
	}
	async saveBeatmapFile<V extends DifficultyImplicitVersion, T extends InferBeatmapFile<"difficulty"> = InferBeatmapSerial<"difficulty", V>>(songId: SongId, beatmapId: BeatmapId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "difficulty", { id: beatmapId });
		return this.saveFile<T>(filename, contents);
	}
	async saveLightshowFile<V extends LightshowImplicitVersion, T extends InferBeatmapFile<"lightshow"> = InferBeatmapSerial<"lightshow", V>>(songId: SongId, lightshowId: BeatmapId, contents: T) {
		const filename = BeatmapFilestore.resolveFilename(songId, "lightshow", { id: lightshowId });
		return this.saveFile<T>(filename, contents);
	}

	async updateInfoContents(songId: SongId, contents: App.Song, options: { serializationOptions: InferInfoSerializationOptions; deserializationOptions: InferInfoDeserializationOptions }) {
		const infoFile = await this.loadInfoFile(songId);
		const version = resolveImplicitVersion(infoFile, 2);
		const currentContents = deserializeInfoContents(version, infoFile, options.deserializationOptions);
		const newContents = serializeInfoContents(version, structuredClone({ ...currentContents, ...contents }), options.serializationOptions);
		await this.saveInfoFile(songId, newContents);
	}
	async updateBeatmapContents(songId: SongId, beatmapId: BeatmapId, contents: Partial<App.BeatmapEntities>, options: { serializationOptions: InferBeatmapSerializationOptions; deserializationOptions: InferBeatmapDeserializationOptions }) {
		const beatmapFile = await this.loadBeatmapFile(songId, beatmapId);
		const beatmapContents = { difficulty: beatmapFile, lightshow: undefined } as PickBeatmapSerials<"difficulty" | "lightshow">;
		const version = resolveImplicitVersion(beatmapFile, 2);
		const currentContents = deserializeBeatmapContents(version, beatmapContents, options.deserializationOptions);
		const newContents = serializeBeatmapContents(version, structuredClone({ ...currentContents, ...contents }), options.serializationOptions);
		await this.saveBeatmapFile(songId, beatmapId, newContents.difficulty);
	}

	async removeAllFilesForSong(songId: SongId, songFilename: string, coverFilename: string, beatmapIds: BeatmapId[]) {
		return Promise.all([
			this.removeFile(BeatmapFilestore.resolveFilename(songId, "info", {})),
			this.removeFile(songFilename),
			this.removeFile(coverFilename),
			...beatmapIds.map((id) => this.removeFile(BeatmapFilestore.resolveFilename(songId, "difficulty", { id: id }))),
			//
		]);
	}
}
