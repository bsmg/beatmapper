import { createAudioData, createBeatmap, hasMappingExtensionsNote, hasMappingExtensionsObstacleV3, loadAudioData, loadDifficulty, loadInfo, loadLightshow, saveAudioData, saveDifficulty, saveInfo, saveLightshow } from "bsmap";
import { type Unzipped, type Zippable, unzip, zip } from "fflate";
import { saveAs } from "file-saver";

import { APP_TOASTER } from "$/components/app/constants";
import { convertMillisecondsToBeats, deriveAudioDataFromFile } from "$/helpers/audio.helpers";
import { deserializeInfoContents } from "$/helpers/packaging.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { getSelectedBeatmap, resolveBeatmapIdFromFilename, resolveLightshowIdFromFilename, resolveSongId } from "$/helpers/song.helpers";
import { filestore } from "$/setup";
import type { App, IEntityMap, SongId } from "$/types";
import { yieldValue } from "$/utils";
import type { BeatmapFileType, ISaveOptions, wrapper } from "bsmap/types";
import type { BeatmapFilestore } from "./file.service";

function* getFileFromArchive(archive: Unzipped, ...filenames: string[]) {
	const allFilenamesInArchive = Object.keys(archive);
	// Ideally, our .zip archive will just have all the files we need.
	for (const filename of filenames) {
		const matchingFilename = allFilenamesInArchive.find((name) => name.toString().toLowerCase() === filename.toLowerCase());
		if (matchingFilename) yield { data: archive[matchingFilename], name: matchingFilename };
	}
	throw new Error(`Missing required files, looking for one of type: ${filenames.toString()}`);
}

interface ZipOptions {
	version: ImplicitVersion | null;
	contents: {
		songId: SongId;
		beatmapsById: IEntityMap<App.IBeatmap>;
		songFile: Blob;
		coverArtFile: Blob;
	};
	options?: Omit<ISaveOptions<BeatmapFileType, 1 | 2 | 3 | 4>, "preprocess" | "postprocess">;
}
export async function zipFiles(filestore: BeatmapFilestore, { version, contents, options }: ZipOptions) {
	const { songId, beatmapsById, songFile, coverArtFile } = contents;
	const encoder = new TextEncoder();

	const wrapperInfo = await filestore.loadInfoContents(songId);

	const implicitInfoVersion = version ?? (wrapperInfo.version >= 0 ? wrapperInfo.version : 4);

	const zippable: Zippable = {
		[wrapperInfo.audio.filename]: new Uint8Array(await songFile.arrayBuffer()),
		[wrapperInfo.coverImageFilename]: new Uint8Array(await coverArtFile.arrayBuffer()),
	};

	const beatmapContents = await Promise.all(
		Object.keys(beatmapsById).map(async (beatmapId) => {
			const difficulty = await filestore.loadBeatmapContents(songId, beatmapId);
			return { beatmap: difficulty };
		}),
	);

	for (const { beatmap: wrapper } of beatmapContents) {
		const implicitBeatmapVersion = version ?? (wrapper.version >= 0 ? wrapper.version : 4);

		const serialDifficulty = saveDifficulty(wrapper.difficulty, implicitBeatmapVersion as ImplicitVersion, {
			optimize: options?.optimize,
			preprocess: [(data) => createBeatmap({ difficulty: data, lightshow: wrapper.lightshow })],
		});
		zippable[wrapper.filename] = encoder.encode(JSON.stringify(serialDifficulty, null, options?.format ?? 2));

		if (implicitBeatmapVersion === 4) {
			const serialLightshow = saveLightshow(wrapper.lightshow, implicitBeatmapVersion, {
				optimize: options?.optimize,
				preprocess: [(data) => createBeatmap({ lightshow: data })],
			});
			zippable[wrapper.lightshowFilename] = encoder.encode(JSON.stringify(serialLightshow, null, options?.format ?? 2));
		}
	}

	const hasMappingExtensions = beatmapContents.some(({ beatmap }) => {
		if (beatmap.difficulty.colorNotes.some((x) => hasMappingExtensionsNote(x))) return true;
		if (beatmap.difficulty.bombNotes.some((x) => hasMappingExtensionsNote(x))) return true;
		if (beatmap.difficulty.obstacles.some((x) => hasMappingExtensionsObstacleV3(x))) return true;
		return false;
	});

	if (hasMappingExtensions && version === 4) {
		throw APP_TOASTER.error({
			id: "incompatible-options",
			description: "Mapping Extensions is not compatible with the v4 map format.",
		});
	}

	const info = saveInfo(wrapperInfo, (implicitInfoVersion === 3 ? 2 : implicitInfoVersion) as Extract<ImplicitVersion, 1 | 2 | 4>, {
		optimize: options?.optimize,
		preprocess: [
			(data) => {
				const beatmaps = data.difficulties.map((x) => {
					const requirements = x.customData._requirements ?? [];
					if (hasMappingExtensions && !requirements.includes("Mapping Extensions")) requirements.push("Mapping Extensions");
					return { ...x, customData: { ...x.customData, _requirements: requirements } };
				});
				return { ...data, difficulties: beatmaps };
			},
		],
	});

	zippable[wrapperInfo.filename] = encoder.encode(JSON.stringify(info, null, options?.format ?? 2));

	if (implicitInfoVersion >= 2) {
		const wrapperAudioData = await filestore.loadAudioDataContents(songId);
		const implicitAudioData = version ?? (wrapperAudioData.version >= 0 ? wrapperAudioData.version : 4);
		const serialAudioData = saveAudioData(wrapperAudioData, (implicitAudioData === 3 ? 2 : implicitAudioData) as Extract<ImplicitVersion, 2 | 4>, {
			optimize: options?.optimize,
		});
		zippable["AudioData.dat"] = encoder.encode(JSON.stringify(serialAudioData, null, options?.format ?? 2));
	}

	const file = await new Promise<Uint8Array>((resolve) => {
		zip(zippable, (_, data) => resolve(data));
	}).then((zippable) => {
		return new File([zippable], `${songId}.zip`);
	});

	saveAs(file, file.name);
}

export async function processImportedMap(zipFile: Uint8Array, options: { currentSongIds?: SongId[]; readonly?: boolean }): Promise<App.ISong> {
	const audioContext = new AudioContext();
	const decoder = new TextDecoder("utf-8");

	// start by unzipping it
	const archive = await new Promise<Record<string, Uint8Array>>((resolve) => {
		unzip(zipFile, (_, data) => resolve(data));
	});

	// pull the info file from the archive
	const info = await yieldValue(
		getFileFromArchive(archive, "Info.dat", "info.json"),
		({ data }) => {
			const contents = decoder.decode(data);
			return loadInfo(JSON.parse(contents));
		},
		() => {
			throw APP_TOASTER.error({
				description: "The file provided is not a valid map archive.",
			});
		},
	);
	// parse the wrapper into the editor form
	const song = deserializeInfoContents(info, { readonly: options.readonly });

	const songId = resolveSongId(song);

	// save the info data (Not 100% sure that this is necessary, but better to have and not need)
	await filestore.saveInfoContents(songId, info);

	// save the assets - cover art and song file - to our local store
	const [songFile, coverArtFile] = await Promise.all([
		await yieldValue(getFileFromArchive(archive, song.songFilename), async ({ data }) => {
			// we'll process the imported blobs as files when we save them to the filestore,
			// that way, we can preserve extra data like the filename and mime type
			return new File([data], song.songFilename);
		}),
		await yieldValue(getFileFromArchive(archive, song.coverArtFilename), async ({ data }) => {
			return new File([data], song.coverArtFilename);
		}),
	]);

	await Promise.all([
		await filestore.saveSongFile(songId, songFile),
		await filestore.saveCoverArtFile(songId, coverArtFile),
		//
	]);

	const { duration, frequency, sampleCount } = await deriveAudioDataFromFile(songFile, audioContext);

	// save the audio data file (currently not supported, but better to store it now for future reference)
	const audioDataContents = await yieldValue(
		getFileFromArchive(archive, info.audio.audioDataFilename, "BPMInfo.dat"),
		async ({ data }) => {
			const contents = decoder.decode(data);
			return loadAudioData(JSON.parse(contents));
		},
		() => {
			// map will not load properly in-game if there isn't at least one bpm change defined. we call this peak stupid.
			const region: wrapper.IWrapAudioDataBPM = {
				startSampleIndex: 0,
				endSampleIndex: sampleCount,
				startBeat: 0,
				endBeat: convertMillisecondsToBeats(duration * 1000, song.bpm),
			};
			return createAudioData({ version: info.version, frequency, sampleCount, bpmData: [region] });
		},
	);

	await filestore.saveAudioDataContents(songId, audioDataContents);

	const beatmapsById = song.difficultiesById;

	// tackle the beatmaps and their entities (notes, obstacles, events).
	// we don't need to load the beatmaps into redux; we'll just write each of them to the filestore so that they can be loaded like any other song from the list.
	for (const beatmap of info.difficulties) {
		const beatmapId = resolveBeatmapIdFromFilename(beatmap.filename);
		const lightshowId = resolveLightshowIdFromFilename(beatmap.lightshowFilename, beatmapId);

		const [{ version, difficulty, lightshow }, { lightshow: derivedLightshow }] = await Promise.all([
			await yieldValue(getFileFromArchive(archive, beatmap.filename), async ({ data }) => {
				const contents = decoder.decode(data);
				return loadDifficulty(JSON.parse(contents));
			}),
			await yieldValue(
				getFileFromArchive(archive, beatmap.lightshowFilename),
				async ({ data }) => {
					const contents = decoder.decode(data);
					return loadLightshow(JSON.parse(contents));
				},
				() => {
					return { lightshow: null };
				},
			),
		]);

		beatmapsById[beatmapId] = {
			...beatmapsById[beatmapId],
			lightshowId,
		};

		const beatmapContents = createBeatmap({
			version: version,
			filename: `${beatmapId}.beatmap.dat`,
			lightshowFilename: `${lightshowId && lightshowId !== "Unnamed" ? lightshowId : beatmapId}.lightshow.dat`,
			difficulty: difficulty,
			lightshow: derivedLightshow ?? lightshow,
		});

		await filestore.saveBeatmapContents(songId, beatmapId, beatmapContents);
	}

	return {
		...song,
		selectedDifficulty: getSelectedBeatmap(song),
		createdAt: Date.now(),
	};
}
