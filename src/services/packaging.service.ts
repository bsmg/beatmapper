import { typeByExtension } from "@std/media-types/type-by-extension";
import { extname } from "@std/path/extname";
import { toPascalCase } from "@std/text/to-pascal-case";
import {
	type BeatmapFileType,
	compatibilityCheck,
	createAudioData,
	createBeatmap,
	type ILoadOptions,
	type InferBeatmapVersion,
	type ISaveOptions,
	type IWrapAudioData,
	type IWrapBeatmap,
	type IWrapInfo,
	loadAudioData,
	loadDifficulty,
	loadInfo,
	loadLightshow,
	type ModRequirements,
	saveAudioData,
	saveDifficulty,
	saveInfo,
	saveLightshow,
} from "bsmap";
import { type Unzipped, unzip, type Zippable, zip } from "fflate";

import { createAudioDataContentsFromFile, createBpmDataFromDifficulty, createBpmEventsFromAudioData } from "$/helpers/audio.helpers";
import { createPlaceholderImageFile } from "$/helpers/file.helpers";
import { deserializeInfoContents, resolveBeatmapIdFromFilename } from "$/helpers/packaging.helpers";
import { createSongId, resolveSongId } from "$/helpers/song.helpers";
import type { App, SongId } from "$/types";
import { deepAssign, ensureArray, yieldValue } from "$/utils";
import type { BeatmapFilestore } from "./file.service";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

const COMMON_EXTENSIONS: Record<string, string> = {
	".egg": "audio/ogg",
	".dat": "application/json",
};

function* getFileFromArchive(archive: Unzipped, paths: string[]) {
	const allPathsInArchive = Object.keys(archive);

	for (const queryPath of paths) {
		const matchingFilename = allPathsInArchive.find((archivePath) => queryPath === archivePath);

		if (matchingFilename) {
			const extension = extname(matchingFilename);
			const type = COMMON_EXTENSIONS[extension] ?? typeByExtension(extension);

			yield { data: archive[matchingFilename], name: matchingFilename, type };
		}
	}
	throw new Error(`Missing required files, looking for one of type: ${paths.toString()}`);
}

function resolveImplicitVersion<T extends BeatmapFileType>(data: { version: number }, override: number | null, resolver = (version: InferBeatmapVersion) => version as InferBeatmapVersion<T>): InferBeatmapVersion<T> {
	return resolver((override as InferBeatmapVersion) ?? (data.version >= 0 ? data.version : 4));
}

export interface MapArchiveContents {
	songFile: File;
	coverArtFile: File;
	info: IWrapInfo;
	audioData: IWrapAudioData;
	beatmaps: IWrapBeatmap[];
}

export interface ImportMapArchiveOptions {
	loadOptions?: Omit<ILoadOptions<BeatmapFileType, InferBeatmapVersion>, "preprocess" | "postprocess">;
}

export async function importMapArchive(archive: Uint8Array, audioContext: AudioContext, { loadOptions }: ImportMapArchiveOptions): Promise<MapArchiveContents> {
	const unzipped = await new Promise<Unzipped>((resolve, reject) =>
		unzip(archive, (err, data) => {
			if (err) return reject(err);
			resolve(data);
		}),
	);

	const info = await yieldValue(getFileFromArchive(unzipped, ["Info.dat", "info.dat", "info.json"])).then(({ data }) => {
		return loadInfo(JSON.parse(decoder.decode(data)), null, loadOptions);
	});

	const [songFile, coverArtFile] = await Promise.all([
		await yieldValue(getFileFromArchive(unzipped, [info.audio.filename])).then(({ data, name, type }) => {
			return new File([data as BlobPart], name, { type: type ?? "application/octet-stream" });
		}),
		await yieldValue(getFileFromArchive(unzipped, [info.coverImageFilename]))
			.then(({ data, name, type }) => {
				return new File([data as BlobPart], name, { type: type ?? "application/octet-stream" });
			})
			.catch(() => createPlaceholderImageFile()),
	]);

	const beatmaps = await Promise.all(
		info.difficulties.map(async (infoBeatmap) => {
			const [difficultyContents, lightshowContents] = await Promise.all([
				await yieldValue(getFileFromArchive(unzipped, [infoBeatmap.filename])).then(({ data }) => {
					const beatmapId = resolveBeatmapIdFromFilename(infoBeatmap.filename);
					infoBeatmap.filename = `${beatmapId}.beatmap.dat`;
					return loadDifficulty(JSON.parse(decoder.decode(data)), null, loadOptions);
				}),
				await yieldValue(getFileFromArchive(unzipped, [infoBeatmap.lightshowFilename]))
					.then(({ data }) => {
						const lightshowId = resolveBeatmapIdFromFilename(infoBeatmap.lightshowFilename);
						infoBeatmap.lightshowFilename = `${lightshowId}.lightshow.dat`;
						return loadLightshow(JSON.parse(decoder.decode(data)), null, loadOptions);
					})
					.catch(() => {
						const beatmapId = resolveBeatmapIdFromFilename(infoBeatmap.filename);
						infoBeatmap.lightshowFilename = `${beatmapId}.lightshow.dat`;
						return { lightshow: null };
					}),
			]);

			return createBeatmap({
				version: difficultyContents.version,
				difficulty: difficultyContents.difficulty,
				filename: infoBeatmap.filename,
				lightshowFilename: infoBeatmap.lightshowFilename,
				lightshow: lightshowContents.lightshow ?? difficultyContents.lightshow,
				customData: difficultyContents.customData,
			});
		}),
	);

	const audioData = await yieldValue(getFileFromArchive(unzipped, [info.audio.audioDataFilename, "BPMInfo.dat"]))
		.then(({ data }) => {
			return loadAudioData(JSON.parse(decoder.decode(data)), null, loadOptions);
		})
		.catch(async () => {
			const { frequency, bpmData, ...rest } = await createAudioDataContentsFromFile(songFile, audioContext, { version: info.version, bpm: info.audio.bpm });
			return createAudioData({ ...rest, frequency, bpmData: createBpmDataFromDifficulty(beatmaps[0].difficulty, frequency, bpmData[0].endBeat) });
		});

	return { info, audioData, beatmaps, songFile, coverArtFile };
}

export async function importMapArchiveToFilestore(archive: Uint8Array, audioContext: AudioContext, filestore: BeatmapFilestore, { currentSongIds = [], readonly, ...options }: ImportMapArchiveOptions & { currentSongIds?: SongId[] } & Parameters<typeof deserializeInfoContents>[1]): Promise<App.ISong> {
	const { songFile, coverArtFile, info, audioData, beatmaps } = await importMapArchive(archive, audioContext, options);

	const song = deserializeInfoContents(info, { readonly });

	const songId = createSongId(song, currentSongIds);

	const beatmapCache = beatmaps.reduce((acc: Record<string, IWrapBeatmap>, beatmap) => {
		acc[resolveBeatmapIdFromFilename(beatmap.filename)] = beatmap;
		return acc;
	}, {});

	await Promise.all([
		filestore.saveSongFile(songId, songFile),
		filestore.saveCoverArtFile(songId, coverArtFile),
		filestore.saveInfoContents(songId, info),
		filestore.saveAudioDataContents(songId, audioData),
		...Object.keys(song.difficultiesById).map((beatmapId) => filestore.saveBeatmapContents(songId, beatmapId, beatmapCache[beatmapId])),
	]);

	return {
		...song,
		id: songId,
		createdAt: Date.now(),
	};
}

export interface ExportMapArchiveOptions {
	version: InferBeatmapVersion | null;
	saveOptions?: Omit<ISaveOptions<BeatmapFileType, InferBeatmapVersion>, "preprocess" | "postprocess">;
}

export async function exportMapArchive({ songFile, coverArtFile, info, audioData, beatmaps }: MapArchiveContents, { version, saveOptions }: ExportMapArchiveOptions): Promise<File> {
	const zippable: Zippable = {};
	const format = saveOptions?.format ?? 2;

	const [songFileBuffer, coverArtFileBuffer] = await Promise.all([songFile.arrayBuffer(), coverArtFile.arrayBuffer()]);

	zippable[info.audio.filename] = new Uint8Array(songFileBuffer);
	zippable[info.coverImageFilename] = new Uint8Array(coverArtFileBuffer);

	const infoVersion = resolveImplicitVersion<"info">(info, version, (v) => (v === 3 ? 2 : v));

	if (infoVersion >= 2) {
		const audioDataVersion = resolveImplicitVersion<"audioData">(audioData, version, (v) => (v === 3 || v === 1 ? 2 : v));
		const audioDataFilename = audioDataVersion === 2 ? "BPMInfo.dat" : audioData.filename;

		const serialAudioData = saveAudioData(audioData, audioDataVersion, {
			...saveOptions,
			preprocess: [(data) => ({ ...data, filename: audioDataFilename })],
		});
		zippable[audioDataFilename] = encoder.encode(JSON.stringify(serialAudioData, null, format));
	}

	const requirements: Record<string, ModRequirements[]> = {};

	for (const beatmap of beatmaps) {
		const beatmapVersion = resolveImplicitVersion<"difficulty">(beatmap, version, (v) => v);

		requirements[beatmap.filename] = [];

		try {
			compatibilityCheck("difficulty", createBeatmap(beatmap), beatmapVersion, { throwOn: { incompatibleObject: false, mappingExtensions: true } });
		} catch {
			requirements[beatmap.filename].push("Mapping Extensions");
		}

		const serialDifficulty = saveDifficulty(beatmap.difficulty, beatmapVersion, {
			...saveOptions,
			preprocess: [
				(data, version) => {
					if (version && version < 3) {
						data.arcs = [];
					}
					if (version && version < 4) {
						data.bpmEvents = createBpmEventsFromAudioData(audioData);
					}
					return createBeatmap({ ...beatmap, difficulty: data });
				},
			],
		});
		zippable[beatmap.filename] = encoder.encode(JSON.stringify(serialDifficulty, null, format));

		if (beatmapVersion === 4) {
			const serialLightshow = saveLightshow(beatmap.lightshow, beatmapVersion, {
				...saveOptions,
				preprocess: [(data) => createBeatmap({ ...beatmap, lightshow: data })],
			});
			zippable[beatmap.lightshowFilename] = encoder.encode(JSON.stringify(serialLightshow, null, format));
		}
	}

	const serialInfo = saveInfo(info, infoVersion, {
		...saveOptions,
		preprocess: [
			(data, version) => {
				if (version && version >= 4 && !data.environmentNames.length) {
					data.environmentNames = [data.environmentBase.normal ?? "DefaultEnvironment", data.environmentBase.allDirections ?? "GlassDesertEnvironment"];
					for (const beatmap of data.difficulties) {
						beatmap.environmentId = beatmap.characteristic === "360Degree" || beatmap.characteristic === "90Degree" ? 1 : 0;
					}
				}
				return {
					...data,
					difficulties: data.difficulties.map((infoBeatmap) => {
						return { ...infoBeatmap, customData: deepAssign(infoBeatmap.customData, { _requirements: ensureArray(requirements[infoBeatmap.filename]) }) };
					}),
				};
			},
		],
	});
	zippable[info.filename] = encoder.encode(JSON.stringify(serialInfo, null, format));

	const { buffer } = await new Promise<Uint8Array<ArrayBufferLike>>((resolve) => {
		zip(zippable, (_, data) => resolve(data));
	});

	return new File([buffer as BlobPart], `${toPascalCase(info.song.title.replaceAll(/[^a-zA-Z0-9 ]+/g, ""))}.zip`);
}

export async function exportMapArchiveFromFilestore(song: App.ISong, filestore: BeatmapFilestore, options: ExportMapArchiveOptions) {
	const songId = resolveSongId(song);

	const [songFile, coverArtFile, info, audioData, ...beatmaps] = await Promise.all([
		filestore.loadSongFile(songId),
		filestore.loadCoverArtFile(songId),
		filestore.loadInfoContents(songId),
		filestore.loadAudioDataContents(songId),
		...Object.keys(song.difficultiesById).map((beatmapId) => filestore.loadBeatmapContents(songId, beatmapId)),
	]);

	return exportMapArchive({ songFile, coverArtFile, info, audioData, beatmaps }, options);
}
