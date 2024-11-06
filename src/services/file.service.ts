import { createStorage } from "unstorage";

import { defaultCoverArtPath } from "$/assets";
import type { App, BeatmapId, Json, Member, SongId } from "$/types";
import { type LegacyStorageSchema, createDriver } from "./storage.service";

// These are the types of things we'll need to save.
export const FileType = {
	INFO: "info",
	BEATMAP: "beatmap",
	SONG: "song",
	COVER: "cover-art",
} as const;
export type FileType = Member<typeof FileType>;

// These are the types of things we're able to save
export type Saveable = File | Blob | ArrayBuffer | string;

export const driver = createDriver<LegacyStorageSchema>({
	name: "beat-mapper-files",
	version: 2,
	async upgrade(idb, current, next, tx) {
		await idb.createStore("keyvaluepairs", tx);
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);
	},
});

const filestore = createStorage({
	driver: driver({ name: "keyvaluepairs" }),
});

//////////////////////// LOW-LEVEL UTILS ////////////////////////
// Low-level generic utilities.
// Ideally, shouldn't be used outside this file.

export async function saveFile(filename: string, file: Saveable) {
	await filestore.setItemRaw(filename, file);
	return [filename, file] as [filename: string, contents: typeof file];
}
export function getFile<T extends Saveable>(filename: string): Promise<T | null> {
	return filestore.getItemRaw<T>(filename);
}
export function deleteFile(filename: string): Promise<void> {
	return filestore.removeItem(filename);
}
export function deleteFiles(filenames: Array<string>): Promise<Array<void>> {
	return Promise.all(filenames.map((filename) => filestore.removeItem(filename)));
}

function getExtension(filename: string, defaultExtension = "") {
	const match = filename.match(/\.[a-zA-Z]+$/);

	if (!match) return defaultExtension;

	return match[0].slice(1);
}

//////////////////////// HELPERS ////////////////////////

type Metadata = { extension?: string; difficulty?: BeatmapId };

/**
 * Name looker-upper.
 *
 * @example getFilenameForThing(123, 'song')
 *  -> `123_song.ogg`
 * @example getFilenameForThing(123, 'cover-art', { extension: 'jpg' })
 *  -> `123_cover.jpg`
 * @example getFilenameForThing(123, 'beatmap', { difficulty: 'ExpertPlus' })
 *  -> `123_ExpertPlus.dat`
 */
export function getFilenameForThing(songId: SongId, type: FileType, metadata: Metadata = {}) {
	switch (type) {
		case FileType.SONG: {
			return `${songId}_song.ogg`;
		}

		case FileType.COVER: {
			if (!metadata.extension) throw new Error("Must supply a file extension for cover art.");

			return `${songId}_cover.${metadata.extension}`;
		}

		case FileType.INFO: {
			return `${songId}_Info.dat`;
		}

		case FileType.BEATMAP: {
			if (!metadata.difficulty) throw new Error("Must supply a difficulty for beatmaps.");

			return `${songId}_${metadata.difficulty}.dat`;
		}

		default:
			throw new Error(`Unrecognized type: ${type}`);
	}
}

//////////////////////// PERSISTENCE AND RETRIEVAL METHODS ////////////////////////
// Sugar around `saveFile` and `getFile`.
// Ideally, the app should use these helpers so that all of the concerns around filename resolution happens in one place, and isn't spread across the app.

export async function getBeatmap(songId: SongId, difficulty: BeatmapId): Promise<Json.Beatmap> {
	// Start by getting the entities (notes, events, etc) for this map
	const beatmapFilename = getFilenameForThing(songId, FileType.BEATMAP, {
		difficulty,
	});

	const beatmapContents = await getFile(beatmapFilename);
	if (!beatmapContents) throw new Error(`No beatmap file found for ${songId}/${difficulty}`);

	if (typeof beatmapContents === "string") return JSON.parse(beatmapContents);

	throw new Error(`Expected beatmapFilename to load a string, loaded: ${typeof beatmapContents}`);
}

export function saveSongFile(songId: SongId, songFile: File | Blob) {
	const songFilename = getFilenameForThing(songId, FileType.SONG);
	return saveFile(songFilename, songFile);
}

async function saveBackupCoverArt() {
	// If the user doesn't have a cover image yet, we'll supply a default.
	// Ideally we'd need a File, to be consistent with the File we get from a locally-selected file, but a Blob is near-identical. If it looks like a duck, etc.
	// I need to convert the file URL I have into a Blob, and then save that to indexedDB.
	// TODO: I should first check and see if the user has already saved this placeholder, so that I can skip overwriting it.
	const pathPieces = defaultCoverArtPath.split("/");
	const coverArtFilename = pathPieces[pathPieces.length - 1];

	const res = await window.fetch(defaultCoverArtPath);
	const blob = await res.blob();
	return await saveFile(coverArtFilename, blob);
}

export function saveLocalCoverArtFile(songId: SongId, coverArtFile?: File) {
	if (coverArtFile) {
		const extension = getExtension(coverArtFile.name, "unknown");
		const coverArtFilename = getFilenameForThing(songId, FileType.COVER, {
			extension,
		});

		return saveFile(coverArtFilename, coverArtFile);
	}
	return saveBackupCoverArt();
}

export function saveCoverArtFromBlob(songId: SongId, coverArtBlob?: Blob, originalCoverArtFilename?: string) {
	if (coverArtBlob) {
		// When uploading a .zip file, we don't have a File object for the image, we get a Blob instead.
		// Blobs don't have a `name` property, so instead we need it to be passed as a 5th parameter.
		if (typeof originalCoverArtFilename === "undefined") throw new Error("You must supply an original filename when saving cover art as a Blob instead of a File.");

		const extension = getExtension(originalCoverArtFilename, "unknown");

		const coverArtFilename = getFilenameForThing(songId, FileType.COVER, {
			extension,
		});

		return saveFile(coverArtFilename, coverArtBlob);
	}
	return saveBackupCoverArt();
}

export function saveBeatmap(songId: SongId, difficulty: BeatmapId, beatmapContents: string) {
	const beatmapFilename = getFilenameForThing(songId, FileType.BEATMAP, {
		difficulty,
	});

	// Make sure we're saving a stringified object.
	let beatmapContentsString = beatmapContents;
	if (typeof beatmapContents === "object") {
		beatmapContentsString = JSON.stringify(beatmapContents);
	}

	return saveFile(beatmapFilename, beatmapContentsString);
}

export function saveInfoDat(songId: SongId, infoContent: string) {
	const infoDatFilename = getFilenameForThing(songId, FileType.INFO);

	return saveFile(infoDatFilename, infoContent);
}

/**
 * If the user deletes a song, we have a lot of stuff to get rid of:
 *   - Song file (.ogg)
 *   - Cover art
 *   - All difficulty beatmaps
 *   - Info.dat
 */
export async function deleteAllSongFiles(song: App.Song) {
	const { id, songFilename, coverArtFilename, difficultiesById } = song;

	const infoDatName = getFilenameForThing(id, FileType.INFO);
	const beatmapFilenames = Object.keys(difficultiesById).map((difficultyId) => {
		return getFilenameForThing(id, FileType.BEATMAP, {
			difficulty: difficultyId,
		});
	});

	try {
		await deleteFile(songFilename);
		await deleteFile(coverArtFilename);
		await deleteFile(infoDatName);
		await deleteFiles(beatmapFilenames);
		console.info(`Successfully deleted all files related to ${id}.`);
	} catch (err) {
		console.error("Could not delete all files for song:", err);
	}
}
