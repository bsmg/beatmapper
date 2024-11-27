/**
 * This service zips up the current state, to let the user download it.
 */

import { formatDate } from "date-fns/format";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { convertBookmarksToExportableJson } from "$/helpers/bookmarks.helpers";
import { formatColorForMods } from "$/helpers/colors.helpers";
import { convertEventsToExportableJson } from "$/helpers/events.helpers";
import { convertBlocksToExportableJson, convertMinesToExportableJson, convertNotesToMappingExtensions } from "$/helpers/notes.helpers";
import { convertObstaclesToExportableJson } from "$/helpers/obstacles.helpers";
import { resolveSongId, sortBeatmapIds } from "$/helpers/song.helpers";
import { filestore } from "$/setup";
import { selectAllBasicEvents, selectAllBombNotes, selectAllBookmarks, selectAllColorNotes, selectAllObstacles } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { App, Difficulty, type Json, type SongId } from "$/types";
import { isEmpty, omit } from "$/utils";
import { deriveDefaultModSettingsFromBeatmap, getArchiveVersion, getDifficultyRankForDifficulty, getFileFromArchive, shiftEntitiesByOffset } from "./packaging.service.nitty-gritty";

const LIGHTSHOW_FILENAME = "EasyLightshow.dat";

export function createInfoContent(song: Omit<App.Song, "id" | "songFilename" | "coverArtFilename" | "createdAt" | "lastOpenedAt">, meta = { version: 2 }) {
	const difficultyIds = sortBeatmapIds(Object.keys(song.difficultiesById));
	const difficulties = difficultyIds.map((id) => song.difficultiesById[id]);

	// We need to make sure we store numbers as numbers. This SHOULD be done at a higher level, but may not be.
	const bpm = Number(song.bpm);
	const offset = Number(song.offset);

	// Has this song enabled any mod support?
	const requirements: string[] = [];
	const mappingExtensionsEnabled = !!song.modSettings.mappingExtensions?.isEnabled;
	if (mappingExtensionsEnabled) {
		requirements.push("Mapping Extensions");
	}

	const editorSettings = {
		enabledFastWalls: song.enabledFastWalls,
		modSettings: !isEmpty(song.modSettings) ? song.modSettings : undefined,
	};

	// biome-ignore lint/suspicious/noImplicitAnyLet: awaiting rewrite
	let contents;
	if (meta.version === 1) {
		contents = {
			songName: song.name,
			songSubName: song.subName,
			authorName: song.artistName,
			beatsPerMinute: bpm,
			previewStartTime: song.previewStartTime,
			previewDuration: song.previewDuration,
			coverImagePath: "cover.jpg",
			environmentName: song.environment,
			difficultyLevels: difficulties.map((difficulty) => ({
				difficulty: difficulty.id,
				difficultyRank: getDifficultyRankForDifficulty(difficulty),
				audioPath: "song.ogg",
				jsonPath: `${difficulty.id}.json`,
				offset: offset,
				oldOffset: offset,
			})),
		};
	} else if (meta.version === 2) {
		const beatmapSets = [
			{
				_beatmapCharacteristicName: "Standard",
				_difficultyBeatmaps: difficulties.map((difficulty) => {
					const difficultyData = {
						_difficulty: difficulty.id,
						_difficultyRank: getDifficultyRankForDifficulty(difficulty),
						_beatmapFilename: `${difficulty.id}.dat`,
						_noteJumpMovementSpeed: difficulty.noteJumpSpeed,
						_noteJumpStartBeatOffset: difficulty.startBeatOffset,
						_customData: {
							_editorOffset: offset !== 0 ? offset : undefined,
							_requirements: requirements.length > 0 ? requirements : undefined,
						},
					} as Json.BeatmapDifficulty;

					if (difficulty.customLabel) {
						difficultyData._customData ??= {};
						difficultyData._customData._difficultyLabel = difficulty.customLabel;
					}

					return difficultyData;
				}),
			},
		];

		if (song.enabledLightshow) {
			beatmapSets.push({
				_beatmapCharacteristicName: "Lightshow",
				_difficultyBeatmaps: [
					{
						_difficulty: Difficulty.EASY,
						_difficultyRank: 1,
						_beatmapFilename: "EasyLightshow.dat",
						_noteJumpMovementSpeed: 16,
						_noteJumpStartBeatOffset: 0,
						_customData: {
							_editorOffset: offset !== 0 ? offset : undefined,
							_requirements: requirements.length > 1 ? requirements : undefined,
							_difficultyLabel: "Lightshow",
						},
					},
				],
			});
		}

		contents = {
			_version: "2.0.0",
			_songName: song.name,
			_songSubName: song.subName || "",
			_songAuthorName: song.artistName,
			_levelAuthorName: song.mapAuthorName || "",
			_beatsPerMinute: bpm,
			_songTimeOffset: 0,
			_shuffle: 0,
			_shufflePeriod: 0.5,
			_previewStartTime: song.previewStartTime,
			_previewDuration: song.previewDuration,
			_songFilename: "song.ogg",
			_coverImageFilename: "cover.jpg",
			_environmentName: song.environment,
			_allDirectionsEnvironmentName: "GlassDesertEnvironment",
			_customData: {
				_editors: {
					_lastEditedBy: "Beatmapper",
					Beatmapper: {
						version: version,
						editorSettings: !isEmpty(editorSettings) ? editorSettings : undefined,
					},
				},
			},
			_difficultyBeatmapSets: beatmapSets,
		};

		// If the user has enabled custom colors, we need to include that as well
		const enabledCustomColors = !!song.modSettings.customColors?.isEnabled;
		if (enabledCustomColors && song.modSettings.customColors) {
			const colors = song.modSettings.customColors;

			const colorData = {
				_colorLeft: colors.colorLeft ? formatColorForMods(App.BeatmapColorKey.SABER_LEFT, colors.colorLeft, colors.colorLeftOverdrive) : undefined,
				_colorRight: colors.colorRight ? formatColorForMods(App.BeatmapColorKey.SABER_RIGHT, colors.colorRight, colors.colorRightOverdrive) : undefined,
				_envColorLeft: colors.envColorLeft ? formatColorForMods(App.BeatmapColorKey.ENV_LEFT, colors.envColorLeft, colors.envColorLeftOverdrive) : undefined,
				_envColorRight: colors.envColorRight ? formatColorForMods(App.BeatmapColorKey.ENV_RIGHT, colors.envColorRight, colors.envColorRightOverdrive) : undefined,
				_obstacleColor: colors.obstacleColor ? formatColorForMods(App.BeatmapColorKey.OBSTACLE, colors.obstacleColor, colors.obstacleColorOverdrive) : undefined,
			};

			for (const set of contents._difficultyBeatmapSets) {
				for (const difficulty of set._difficultyBeatmaps) {
					difficulty._customData = {
						...difficulty._customData,
						...colorData,
					};
				}
			}
		}
	} else {
		throw new Error(`Unrecognized version: ${meta.version}`);
	}

	return contents;
}

/**
 * This method takes JSON-formatted entities and produces a JSON string to be saved to the persistence system as a file. This is for the beatmap itself, eg. 'Expert.dat'.
 */
export function createBeatmapContents(
	{ notes = [], obstacles = [], events = [], bookmarks = [] }: { notes?: Json.Note[]; obstacles?: Json.Obstacle[]; events: Json.Event[]; bookmarks?: Json.Bookmark[] },
	meta: { version: number },
	// The following fields are only necessary for v1.
	bpm?: number,
	noteJumpSpeed?: number,
	swing?: number,
	swingPeriod?: number,
) {
	// biome-ignore lint/suspicious/noImplicitAnyLet: awaiting rewrite
	let contents;

	// We need to sort all notes, obstacles, and events, since the game can be funny when things aren't in order.
	function sortByTime<T extends { _time: number }>(a: T, b: T) {
		return a._time - b._time;
	}
	function sortByTimeAndPosition<T extends { _time: number; _lineIndex: number; _lineLayer: number }>(a: T, b: T) {
		if (a._time === b._time && a._lineLayer === b._lineLayer) {
			return a._lineIndex - b._lineIndex;
		}

		if (a._time === b._time) {
			return a._lineLayer - b._lineLayer;
		}

		return sortByTime(a, b);
	}

	let sortedNotes = [...notes].sort(sortByTimeAndPosition);
	let sortedObstacles = [...obstacles].sort(sortByTime);
	let sortedEvents = [...events].sort(sortByTime);

	// Annoyingly sometimes we can end up with floating-point issues on lineIndex and lineLayer. Usually I deal with this in the helpers, but notes don't have a helper yet.
	// Also, now that 'cutDirection' can be 360 degrees, it also needs to be rounded
	sortedNotes = sortedNotes.map((note) => ({
		...note,
		_lineIndex: Math.round(note._lineIndex),
		_lineLayer: Math.round(note._lineLayer),
		_cutDirection: Math.round(note._cutDirection),
	}));

	// Remove 'selected' property
	function removeSelected<T extends object>(entity: T) {
		if ("selected" in entity) {
			const copy = omit(entity, "selected");
			return copy;
		}
		return entity;
	}

	sortedNotes = sortedNotes.map(removeSelected);
	sortedObstacles = sortedObstacles.map(removeSelected);
	sortedEvents = sortedEvents.map(removeSelected);

	if (meta.version === 2) {
		contents = {
			_version: "2.0.0",
			_events: sortedEvents,
			_notes: sortedNotes,
			_obstacles: sortedObstacles,
			_customData: {
				_bookmarks: bookmarks,
			},
		};
	} else if (meta.version === 1) {
		contents = {
			_version: "1.5.0",
			_beatsPerMinute: Number(bpm),
			_beatsPerBar: 16,
			_noteJumpSpeed: Number(noteJumpSpeed),
			_shuffle: Number(swing || 0),
			_shufflePeriod: Number(swingPeriod || 0.5),
			_events: sortedEvents,
			_notes: sortedNotes,
			_obstacles: sortedObstacles,
		};
	} else {
		throw new Error(`unrecognized version: ${meta.version}`);
	}

	return contents;
}

export function createBeatmapContentsFromState(state: RootState, song: Pick<App.Song, "offset" | "bpm" | "modSettings">) {
	const notes = convertBlocksToExportableJson(selectAllColorNotes(state));
	const bombs = convertMinesToExportableJson(selectAllBombNotes(state));
	const events = convertEventsToExportableJson(selectAllBasicEvents(state));
	const obstacles = convertObstaclesToExportableJson(selectAllObstacles(state));
	const bookmarks = convertBookmarksToExportableJson(selectAllBookmarks(state));

	// It's important that notes are sorted by their _time property primarily, and then by _lineLayer secondarily.

	const shiftedNotes = shiftEntitiesByOffset(notes, song.offset, song.bpm);
	const shiftedBombs = shiftEntitiesByOffset(bombs, song.offset, song.bpm);
	const shiftedEvents = shiftEntitiesByOffset(events, song.offset, song.bpm);
	const shiftedObstacles = shiftEntitiesByOffset(obstacles, song.offset, song.bpm);

	// Deselect all entities before saving, we don't want to persist that info.
	const deselect = <T extends object>(entity: T) => ({
		...entity,
		selected: false,
	});
	let deselectedNotes = shiftedNotes.map(deselect);
	let deselectedBombs = shiftedBombs.map(deselect);
	const deselectedObstacles = shiftedObstacles.map(deselect);
	const deselectedEvents = shiftedEvents.map(deselect);

	// If the user has mapping extensions enabled, multiply the notes to sit in the 1000+ range.
	if (song.modSettings.mappingExtensions?.isEnabled) {
		deselectedNotes = convertNotesToMappingExtensions(deselectedNotes);
		deselectedBombs = convertNotesToMappingExtensions(deselectedBombs);
	}

	return createBeatmapContents(
		{
			notes: [...deselectedNotes, ...deselectedBombs],
			obstacles: deselectedObstacles,
			events: deselectedEvents,
			bookmarks,
		},
		{
			version: 2,
		},
	);
}

export const zipFiles = async (song: App.Song, songFile: Blob, coverArtFile: Blob, version: number) => {
	const zip = new JSZip();

	const infoContent = createInfoContent(song, { version });

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

			const legacyFileContents = createBeatmapContents(
				{
					notes: beatmapData._notes,
					obstacles: beatmapData._obstacles,
					events: beatmapData._events,
					bookmarks: beatmapData._customData?._bookmarks ?? [],
				},
				{ version: 1 },
				song.bpm,
				song.difficultiesById[difficulty].noteJumpSpeed,
				song.swingAmount,
				song.swingPeriod,
			);
			zip.file(`${difficulty}.json`, JSON.stringify(legacyFileContents), { binary: false });
		}
	}

	if (version === 2 && song.enabledLightshow) {
		// We want to grab the lights (events). Any beatmap will do
		const { fileContents } = difficultyContents[0];
		if (!fileContents) throw new Error("No file.");

		const events = fileContents._events;

		const lightshowFileContents = createBeatmapContents({ events }, { version: 2 });

		zip.file(LIGHTSHOW_FILENAME, JSON.stringify(lightshowFileContents), { binary: false });
	}

	zip
		.generateAsync({
			type: "blob",
			compression: "DEFLATE",
			compressionOptions: {
				level: 9,
			},
		})
		.then((blob) => {
			const timestamp = formatDate(new Date(), "yyyyMMddTHHmm");
			const filename = version === 1 ? `${song.id}_${timestamp}.legacy.zip` : `${song.id}_${timestamp}.zip`;
			saveAs(blob, filename);
		});
};

// If the user uploads a legacy song, we first need to convert it to our modern file format.
// To make life simpler, this method creates a new ZIP as if this is the work that the user selected, except its contents are in v2 format.
export async function convertLegacyArchive(archive: JSZip) {
	const zip = new JSZip();

	const info = getFileFromArchive(archive, "info.json");
	if (!info) throw new Error("No info file.");
	const infoDatString = await info.async("string");
	const infoDatJson = JSON.parse(infoDatString);

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
			const fileJson = JSON.parse(fileContents);

			const newFileContents = createBeatmapContents(
				{
					notes: fileJson._notes,
					obstacles: fileJson._obstacles,
					events: fileJson._events,
					bookmarks: fileJson._customData?._bookmarks,
				},
				{ version: 2 },
			);

			zip.file(`${level.difficulty}.dat`, JSON.stringify(newFileContents), { binary: false });

			return {
				id: level.difficulty,
				noteJumpSpeed: fileJson._noteJumpSpeed,
				startBeatOffset: 0,
			};
		}),
	);

	// Finally, create our new Info.dat, and zip it up.
	const difficultiesById = loadedDifficultyFiles.reduce((acc, level) => {
		acc[level.id] = level;
		return acc;
	}, {});

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

	const newInfoContent = createInfoContent(fakeSong, { version: 2 });
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
		beatmapSet._difficultyBeatmaps.map(async (beatmap: Json.BeatmapDifficulty) => {
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
