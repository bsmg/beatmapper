import type { v1 as v1t, v2 as v2t } from "bsmap/types";
import { formatDate } from "date-fns/format";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { deserializeBasicEvent } from "$/helpers/events.helpers";
import { type InferBeatmapSerializationOptions, deserializeBeatmapContents, serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { resolveSongId } from "$/helpers/song.helpers";
import { filestore } from "$/setup";
import { selectAllBasicEvents, selectAllBombNotes, selectAllBookmarks, selectAllColorNotes, selectAllObstacles, selectIsModuleEnabled, selectOffsetInBeats } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, SongId } from "$/types";
import { deriveDefaultModSettingsFromBeatmap, getArchiveVersion, getFileFromArchive } from "./packaging.service.nitty-gritty";

const LIGHTSHOW_FILENAME = "EasyLightshow.dat";

export function serializeBeatmapContentsFromState<T extends ImplicitVersion>(version: T, state: RootState, songId: SongId) {
	const editorOffsetInBeats = selectOffsetInBeats(state, songId);
	const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");

	const contents = {
		notes: selectAllColorNotes(state),
		bombs: selectAllBombNotes(state),
		obstacles: selectAllObstacles(state),
		events: selectAllBasicEvents(state),
		bookmarks: selectAllBookmarks(state),
	};

	return serializeBeatmapContents<T>(version, contents, {
		editorOffsetInBeats: editorOffsetInBeats,
		extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
	} as InferBeatmapSerializationOptions<T>);
}

export async function zipFiles(song: App.Song, songFile: Blob, coverArtFile: Blob, version: ImplicitVersion) {
	const zip = new JSZip();

	const infoContent = serializeInfoContents(version, song, {});

	zip.file("song.ogg", songFile, { binary: true });
	zip.file("cover.jpg", coverArtFile, { binary: true });
	if (version === 2) {
		zip.file("Info.dat", JSON.stringify(infoContent), { binary: false });
	} else {
		zip.file("info.json", JSON.stringify(infoContent), { binary: false });
	}

	const difficultyContents = await Promise.all(
		Object.keys(song.difficultiesById).map((difficulty) =>
			filestore.loadBeatmapFile(song.id, difficulty).then((fileContents) => ({
				difficulty,
				fileContents,
			})),
		),
	);

	for (const { difficulty, fileContents } of difficultyContents) {
		if (!fileContents) throw new Error("No file.");
		if (version === 2 && fileContents) {
			zip.file(`${difficulty}.dat`, JSON.stringify(fileContents), { binary: false });
		} else {
			// Our files are stored on disk as v2, since this is the modern actually-used format.
			// I also need to save the v1 difficulties so that folks can edit their map in other mapping software, and this is annoying because it requires totally different info.
			const beatmapData = fileContents;

			const legacyFileContents = serializeBeatmapContents(1, deserializeBeatmapContents(2, { difficulty: beatmapData, lightshow: undefined }, { editorOffsetInBeats: 0 }), {
				editorOffsetInBeats: 0,
				beatsPerMinute: song.bpm,
				jumpSpeed: song.difficultiesById[difficulty].noteJumpSpeed,
				jumpOffset: song.difficultiesById[difficulty].startBeatOffset,
				swingAmount: song.swingAmount,
				swingPeriod: song.swingPeriod,
			});

			zip.file(`${difficulty}.json`, JSON.stringify(legacyFileContents), { binary: false });
		}
	}

	if (version === 2 && song.enabledLightshow) {
		// We want to grab the lights (events). Any beatmap will do
		const { fileContents } = difficultyContents[0];
		if (!fileContents) throw new Error("No file.");

		const events = fileContents._events?.map((x) => deserializeBasicEvent(2, x, {}));

		const lightshowFileContents = serializeBeatmapContents(2, { events }, { editorOffsetInBeats: 0 });

		zip.file(LIGHTSHOW_FILENAME, JSON.stringify(lightshowFileContents), { binary: false });
	}

	zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } }).then((blob) => {
		const timestamp = formatDate(new Date(), "yyyyMMddTHHmm");
		const filename = version === 1 ? `${song.id}_${timestamp}.legacy.zip` : `${song.id}_${timestamp}.zip`;
		saveAs(blob, filename);
	});
}

// If the user uploads a legacy song, we first need to convert it to our modern file format.
// To make life simpler, this method creates a new ZIP as if this is the work that the user selected, except its contents are in v2 format.
export async function convertLegacyArchive(archive: JSZip) {
	const zip = new JSZip();

	const info = getFileFromArchive(archive, "info.json");
	if (!info) throw new Error("No info file.");
	const infoDatString = await info.async("string");
	const infoDatJson = JSON.parse(infoDatString) as v1t.IInfo;

	if (infoDatJson.difficultyLevels.length === 0) {
		throw new Error("This song has no difficulty levels. Because it's in the legacy format, this means we cannot determine critical information about the song.");
	}

	const coverImage = getFileFromArchive(archive, infoDatJson.coverImagePath);
	if (!coverImage) throw new Error("No cover image file.");
	const coverImageFile = await coverImage.async("blob");
	// TODO: Support PNG?
	zip.file("cover.jpg", coverImageFile, { binary: true });

	const { audioPath, offset } = infoDatJson.difficultyLevels[0];
	const song = getFileFromArchive(archive, audioPath);
	if (!song) throw new Error("No song file.");
	const songFile = await song.async("blob");
	zip.file("song.ogg", songFile, { binary: true });

	const bpm = infoDatJson.beatsPerMinute;

	// Create new difficulty files (eg. Expert.dat)
	const loadedDifficultyFiles = await Promise.all(
		infoDatJson.difficultyLevels.map(async (level: { jsonPath: string; difficulty: string }) => {
			const file = getFileFromArchive(archive, level.jsonPath);
			if (!file) throw new Error(`No level file for ${level.difficulty}.`);
			const fileContents = await file.async("string");
			const fileJson = JSON.parse(fileContents) as v1t.IDifficulty;

			const newFileContents = serializeBeatmapContents(2, deserializeBeatmapContents(1, { difficulty: fileJson, lightshow: undefined }, { editorOffsetInBeats: 0 }), { editorOffsetInBeats: 0 });

			zip.file(`${level.difficulty}.dat`, JSON.stringify(newFileContents), { binary: false });

			return {
				id: level.difficulty,
				noteJumpSpeed: fileJson._noteJumpSpeed,
				startBeatOffset: 0,
			};
		}),
	);

	// Finally, create our new Info.dat, and zip it up.
	const difficultiesById = loadedDifficultyFiles.reduce(
		(acc, level) => {
			acc[level.id] = level;
			return acc;
		},
		{} as App.Song["difficultiesById"],
	);

	const fakeSong = {
		name: infoDatJson.songName,
		artistName: infoDatJson.songSubName,
		mapAuthorName: infoDatJson.authorName,
		bpm,
		offset,
		previewStartTime: infoDatJson.previewStartTime,
		previewDuration: infoDatJson.previewDuration,
		environment: infoDatJson.environmentName,
		difficultiesById,
	} as App.Song;

	const newInfoContent = serializeInfoContents(2, fakeSong, {});
	zip.file("Info.dat", JSON.stringify(newInfoContent), { binary: false });

	return zip;
}

export async function processImportedMap(zipFile: Parameters<typeof JSZip.loadAsync>[0], currentSongIds: SongId[]) {
	// Start by unzipping it
	let archive = await JSZip.loadAsync(zipFile);

	const archiveVersion = getArchiveVersion(archive);

	if (archiveVersion !== 2) {
		archive = await convertLegacyArchive(archive);
	}

	// Zipped contents are always treated as binary. We need to convert the Info.dat into something readable
	const info = getFileFromArchive(archive, "Info.dat");
	if (!info) throw new Error("No info file.");
	const infoDatString = await info.async("string");
	const infoDatJson = JSON.parse(infoDatString);
	const songId = resolveSongId({ name: infoDatJson._songName });

	const songIdAlreadyExists = currentSongIds.some((id) => id === songId);
	if (songIdAlreadyExists) {
		const shouldOverwrite = window.confirm("This song appears to be a duplicate. Would you like to overwrite your existing song?");

		if (!shouldOverwrite) {
			throw new Error("Sorry, you already have a song by this name");
		}
	}

	// Save the Info.dat (Not 100% sure that this is necessary, but better to have and not need)
	await filestore.saveInfoFile(songId, JSON.parse(infoDatString));

	// Save the assets - cover art and song file - to our local store
	const song = getFileFromArchive(archive, infoDatJson._songFilename);
	if (!song) throw new Error("No song file.");
	const uncompressedSongFile = await song.async("blob");
	const coverArt = getFileFromArchive(archive, infoDatJson._coverImageFilename);
	if (!coverArt) throw new Error("No cover file.");
	const uncompressedCoverArtFile = await coverArt.async("blob");

	const [{ filename: songFilename, contents: songFile }, { filename: coverArtFilename, contents: coverArtFile }] = await Promise.all([
		await filestore.saveSongFile(songId, uncompressedSongFile, "audio/ogg", infoDatJson._songFilename),
		await filestore.saveCoverFile(songId, uncompressedCoverArtFile, "image/jpeg", infoDatJson._coverImageFilename),
		//
	]);

	// Tackle the difficulties and their entities (notes, obstacles, events).
	// We won't load any of them into redux; instead we'll write it all to disk using our local persistence layer, so that it can be loaded like any other song from the list.

	// While we can export lightshow maps, we don't actually load them.
	const beatmapSet = infoDatJson._difficultyBeatmapSets.find((set: { _beatmapCharacteristicName: string }) => set._beatmapCharacteristicName === "Standard");

	// We do check if a lightshow exists only so we can store that setting, to include lightmaps when exporting
	const enabledLightshow = infoDatJson._difficultyBeatmapSets.some((set: { _beatmapCharacteristicName: string }) => set._beatmapCharacteristicName === "Lightshow");

	const difficultyFiles = await Promise.all(
		beatmapSet._difficultyBeatmaps.map(async (beatmap: v2t.IInfoDifficulty) => {
			const file = getFileFromArchive(archive, beatmap._beatmapFilename);
			if (!file) throw new Error(`No level file for ${beatmap._beatmapFilename}`);
			const fileContents = await file.async("string");
			// TODO: Should I do any cleanup, to verify that the data is legit?
			await filestore.saveBeatmapFile(songId, beatmap._difficulty, JSON.parse(fileContents));
			const beatmapData = {
				id: beatmap._difficulty,
				noteJumpSpeed: beatmap._noteJumpMovementSpeed,
				startBeatOffset: beatmap._noteJumpStartBeatOffset,

				// TODO: Am I actually using `data` for anything? I don't think I am
				data: JSON.parse(fileContents),
			} as App.Beatmap;
			if (beatmap._customData?._difficultyLabel) {
				beatmapData.customLabel = beatmap._customData._difficultyLabel;
			}
			return beatmapData;
		}),
	);

	const difficultiesById = difficultyFiles.reduce((acc, { id, noteJumpSpeed, startBeatOffset, customLabel }) => {
		acc[id] = {
			id,
			noteJumpSpeed,
			startBeatOffset,
			customLabel: customLabel || "",
		};
		return acc;
	}, {});

	let realOffset = 0;
	try {
		realOffset = infoDatJson._difficultyBeatmapSets[0]._difficultyBeatmaps[0]._customData._editorOffset || 0;
	} catch (e) {}

	const wasCreatedInBeatmapper = infoDatJson._customData?._lastEditedBy === "Beatmapper";

	const persistedData = infoDatJson._customData?._editors?.Beatmapper && wasCreatedInBeatmapper ? infoDatJson._customData._editors.Beatmapper.editorSettings : {};

	const modSettings = persistedData.modSettings || deriveDefaultModSettingsFromBeatmap(beatmapSet);

	return {
		songId,
		songFile,
		songFilename,
		coverArtFile,
		coverArtFilename,
		name: infoDatJson._songName,
		subName: infoDatJson._songSubName,
		artistName: infoDatJson._songAuthorName,
		mapAuthorName: infoDatJson._levelAuthorName,
		bpm: infoDatJson._beatsPerMinute,
		offset: realOffset,
		swingAmount: infoDatJson._shuffle,
		swingPeriod: infoDatJson._shufflePeriod,
		previewStartTime: infoDatJson._previewStartTime,
		previewDuration: infoDatJson._previewDuration,
		environment: infoDatJson._environmentName,
		difficultiesById,
		modSettings,
		enabledLightshow,
	};
}
