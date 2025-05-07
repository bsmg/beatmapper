import { saveAs } from "file-saver";
import JSZip from "jszip";

import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { type InferBeatmapSerializationOptions, type PickBeatmapSerials, deserializeBeatmapContents, deserializeInfoContents, resolveBeatmapFilenameForImplicitVersion, serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { filestore } from "$/setup";
import { selectAllBasicEvents, selectAllBombNotes, selectAllBookmarks, selectAllColorNotes, selectAllObstacles, selectIsModuleEnabled, selectOffsetInBeats } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, SongId } from "$/types";
import type { BeatmapFilestore } from "./file.service";
import { getArchiveVersion, getFileFromArchive, resolveImplicitVersion } from "./packaging.service.nitty-gritty";

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

interface BeatmapContents {
	song: App.Song;
	songDuration?: number;
	songFile: Blob;
	coverArtFile: Blob;
}
export async function zipFiles(version: ImplicitVersion, filestore: BeatmapFilestore, { song, songDuration, songFile, coverArtFile }: BeatmapContents) {
	const zip = new JSZip();

	zip.file(song.songFilename, songFile, { binary: true });
	zip.file(song.coverArtFilename, coverArtFile, { binary: true });

	const infoContent = serializeInfoContents(version, song, {
		songDuration: songDuration,
	});

	if (version === 1) {
		zip.file("info.json", JSON.stringify(infoContent), { binary: false });
	} else {
		zip.file("Info.dat", JSON.stringify(infoContent), { binary: false });
	}

	const editorOffsetInBeats = convertMillisecondsToBeats(song.offset, song.bpm);
	const extensionsProvider = song.modSettings.mappingExtensions?.isEnabled ? "mapping-extensions" : undefined;

	const beatmapContents = await Promise.all(
		Object.values(song.difficultiesById).map(async (beatmap) => {
			const contents = { difficulty: {}, lightshow: undefined } as PickBeatmapSerials<"difficulty" | "lightshow">;
			const difficulty = await filestore.loadDifficultyFile(song.id, beatmap.beatmapId);
			contents.difficulty = difficulty;

			if (beatmap.lightshowId) {
				const lightshow = await filestore.loadLightshowFile(song.id, beatmap.lightshowId);
				contents.lightshow = lightshow;
			}

			const beatmapVersion = resolveImplicitVersion(contents.difficulty, 2);
			const entities = deserializeBeatmapContents(beatmapVersion, contents, {
				editorOffsetInBeats,
				extensionsProvider,
			});

			return { beatmapId: beatmap.beatmapId, lightshowId: beatmap.lightshowId, entities };
		}),
	);

	for (const { beatmapId, lightshowId, entities } of beatmapContents) {
		const serialized = serializeBeatmapContents(version, entities, {
			editorOffsetInBeats,
		});

		zip.file(resolveBeatmapFilenameForImplicitVersion(version, beatmapId, "beatmap"), JSON.stringify(serialized.difficulty), {
			binary: false,
		});

		if (lightshowId) {
			zip.file(resolveBeatmapFilenameForImplicitVersion(version, lightshowId, "lightshow"), JSON.stringify(serialized.lightshow), {
				binary: false,
			});
		}
	}

	if (song.enabledLightshow) {
		// We want to grab the lights (events). Any beatmap will do
		const { entities } = beatmapContents[0];

		const lightshowContents = { events: entities.events, bookmarks: entities.bookmarks };

		const lightshowFileContents = serializeBeatmapContents(version, lightshowContents, {
			editorOffsetInBeats: 0,
		});

		zip.file(LIGHTSHOW_FILENAME, JSON.stringify(lightshowFileContents), { binary: false });
	}

	if (version === 4) {
		// HACK: since v4 requires audio data for serialization, we'll just shove this into the final zip until we can add proper support for it :)
		zip.file("AudioData.dat", '{"version":"4.0.0","bpmData":[]}');
	}

	zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } }).then((blob) => {
		const timestamp = new Date().toISOString();
		const filename = `${song.id}.${timestamp}.zip`;
		saveAs(blob, filename);
	});
}

export async function processImportedMap(zipFile: Parameters<typeof JSZip.loadAsync>[0], options: { currentSongIds?: SongId[] }): Promise<App.Song> {
	// Start by unzipping it
	const archive = await JSZip.loadAsync(zipFile);

	const version = await getArchiveVersion(archive);

	const rawSerialInfo = await getFileFromArchive(archive, "Info.dat", "info.json").async("string");
	const info = deserializeInfoContents(version, JSON.parse(rawSerialInfo), {});

	const songAlreadyExists = options?.currentSongIds?.some((id) => id === info.id);
	if (songAlreadyExists) {
		if (!window.confirm("This song appears to be a duplicate. Would you like to overwrite your existing song?")) {
			throw new Error("Sorry, you already have a song by this name");
		}
	}

	// Save the Info.dat (Not 100% sure that this is necessary, but better to have and not need)
	await filestore.saveInfoFile(info.id, JSON.parse(rawSerialInfo));

	// Save the assets - cover art and song file - to our local store
	const songFile = await getFileFromArchive(archive, info.songFilename).async("blob");
	const coverArtFile = await getFileFromArchive(archive, info.coverArtFilename).async("blob");

	const [{ filename: songFilename }, { filename: coverArtFilename }] = await Promise.all([
		await filestore.saveSongFile(info.id, songFile, "audio/ogg", info.songFilename),
		await filestore.saveCoverFile(info.id, coverArtFile, "image/jpeg", info.coverArtFilename),
		//
	]);

	// Tackle the difficulties and their entities (notes, obstacles, events).
	// We won't load any of them into redux; instead we'll write it all to disk using our local persistence layer, so that it can be loaded like any other song from the list.

	for (const beatmap of Object.values(info.difficultiesById)) {
		const rawSerialBeatmap = await getFileFromArchive(archive, `${beatmap.beatmapId}.json`, `${beatmap.beatmapId}.dat`, `${beatmap.beatmapId}.beatmap.dat`).async("string");
		await filestore.saveDifficultyFile(info.id, beatmap.beatmapId, JSON.parse(rawSerialBeatmap));
		if (beatmap.lightshowId) {
			const rawSerialLightshow = await getFileFromArchive(archive, `${beatmap.lightshowId}.json`, `${beatmap.lightshowId}.dat`, `${beatmap.lightshowId}.lightshow.dat`).async("string");
			await filestore.saveLightshowFile(info.id, beatmap.lightshowId, JSON.parse(rawSerialLightshow));
		}
	}

	return {
		...info,
		songFilename,
		coverArtFilename,
		selectedDifficulty: Object.keys(info.difficultiesById)[0],
		createdAt: Date.now(),
	};
}
