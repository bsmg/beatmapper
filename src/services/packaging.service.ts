import { createAudioData, createBeatmap, hasMappingExtensionsNote, hasMappingExtensionsObstacleV3, loadAudioData, loadDifficulty, loadInfo, loadLightshow, saveAudioData, saveDifficulty, saveInfo, saveLightshow } from "bsmap";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { deriveAudioDataFromFile } from "$/helpers/audio.helpers";
import { deserializeInfoContents } from "$/helpers/packaging.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { getSelectedBeatmap, resolveBeatmapIdFromFilename, resolveLightshowIdFromFilename, resolveSongId } from "$/helpers/song.helpers";
import { filestore } from "$/setup";
import type { App, IEntityMap, SongId } from "$/types";
import { tryYield } from "$/utils";
import type { BeatmapFileType, ISaveOptions } from "bsmap/types";
import type { BeatmapFilestore } from "./file.service";

function* getFileFromArchive(archive: JSZip, ...filenames: string[]) {
	const allFilenamesInArchive = Object.keys(archive.files);
	// Ideally, our .zip archive will just have all the files we need.
	for (const filename of filenames) {
		const matchingFilename = allFilenamesInArchive.find((name) => name.toString().toLowerCase() === filename.toLowerCase());
		if (matchingFilename) yield archive.files[matchingFilename];
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

	const zip = new JSZip();

	const wrapperInfo = await filestore.loadInfoContents(songId);

	const implicitInfoVersion = version ?? (wrapperInfo.version >= 0 ? wrapperInfo.version : 4);

	zip.file(wrapperInfo.audio.filename, songFile, { binary: true });
	zip.file(wrapperInfo.coverImageFilename, coverArtFile, { binary: true });

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
		zip.file(wrapper.filename, JSON.stringify(serialDifficulty, null, options?.format ?? 2), {
			binary: false,
		});

		if (implicitBeatmapVersion === 4) {
			const serialLightshow = saveLightshow(wrapper.lightshow, implicitBeatmapVersion, {
				optimize: options?.optimize,
				preprocess: [(data) => createBeatmap({ lightshow: data })],
			});
			zip.file(wrapper.lightshowFilename, JSON.stringify(serialLightshow, null, options?.format ?? 2), {
				binary: false,
			});
		}
	}

	const hasMappingExtensions = beatmapContents.some(({ beatmap }) => {
		if (beatmap.difficulty.colorNotes.some((x) => hasMappingExtensionsNote(x))) return true;
		if (beatmap.difficulty.bombNotes.some((x) => hasMappingExtensionsNote(x))) return true;
		if (beatmap.difficulty.obstacles.some((x) => hasMappingExtensionsObstacleV3(x))) return true;
		return false;
	});

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

	zip.file(wrapperInfo.filename, JSON.stringify(info, null, options?.format ?? 2), { binary: false });

	if (implicitInfoVersion >= 2) {
		const wrapperAudioData = await filestore.loadAudioDataContents(songId);
		const implicitAudioData = version ?? (wrapperAudioData.version >= 0 ? wrapperAudioData.version : 4);
		const serialAudioData = saveAudioData(wrapperAudioData, (implicitAudioData === 3 ? 2 : implicitAudioData) as Extract<ImplicitVersion, 2 | 4>, {
			optimize: options?.optimize,
		});
		zip.file("AudioData.dat", JSON.stringify(serialAudioData, null, options?.format ?? 2));
	}

	zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } }).then((blob) => {
		const filename = `${songId}.zip`;
		saveAs(blob, filename);
	});
}

export async function processImportedMap(zipFile: Parameters<typeof JSZip.loadAsync>[0], options: { currentSongIds?: SongId[]; readonly?: boolean }): Promise<App.ISong> {
	const audioContext = new AudioContext();
	// start by unzipping it
	const archive = await JSZip.loadAsync(zipFile);

	// pull the info file from the archive
	const info = await tryYield(getFileFromArchive(archive, "Info.dat", "info.json"), async (o) => {
		return o.async("string").then((rawContents) => {
			return loadInfo(JSON.parse(rawContents));
		});
	});
	// parse the wrapper into the editor form
	const song = deserializeInfoContents(info, { readonly: options.readonly });

	const songId = resolveSongId(song);

	const songAlreadyExists = options.currentSongIds?.some((id) => id === songId);
	if (songAlreadyExists) {
		if (!window.confirm("This song appears to be a duplicate. Would you like to overwrite your existing song?")) {
			throw new Error("Sorry, you already have a song by this name");
		}
	}

	// save the info data (Not 100% sure that this is necessary, but better to have and not need)
	await filestore.saveInfoContents(songId, info);

	// save the assets - cover art and song file - to our local store
	const [songFile, coverArtFile] = await Promise.all([
		await tryYield(getFileFromArchive(archive, song.songFilename), async (o) => {
			return o.async("blob").then((blob) => {
				// we'll process the imported blobs as files when we save them to the filestore,
				// that way, we can preserve extra data like the filename and mime type
				return new File([blob], song.songFilename, { type: blob.type !== "" ? blob.type : "audio/ogg" });
			});
		}),
		await tryYield(getFileFromArchive(archive, song.coverArtFilename), async (o) => {
			return o.async("blob").then((blob) => {
				return new File([blob], song.coverArtFilename, { type: blob.type !== "" ? blob.type : "image/jpeg" });
			});
		}),
	]);

	await Promise.all([
		await filestore.saveSongFile(songId, songFile),
		await filestore.saveCoverArtFile(songId, coverArtFile),
		//
	]);

	const { frequency, sampleCount } = await deriveAudioDataFromFile(songFile, audioContext);

	// save the audio data file (currently not supported, but better to store it now for future reference)
	const audioDataContents = await tryYield(
		getFileFromArchive(archive, info.audio.audioDataFilename, "BPMInfo.dat"),
		async (o) => {
			return o.async("string").then((rawContents) => {
				return loadAudioData(JSON.parse(rawContents));
			});
		},
		() => {
			return createAudioData({ version: info.version, frequency, sampleCount });
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
			await tryYield(getFileFromArchive(archive, beatmap.filename), async (o) => {
				return o.async("string").then((rawContents) => {
					return loadDifficulty(JSON.parse(rawContents), {
						schemaCheck: { enabled: false },
					});
				});
			}),
			await tryYield(
				getFileFromArchive(archive, beatmap.lightshowFilename),
				async (o) => {
					return o.async("string").then((rawContents) => {
						return loadLightshow(JSON.parse(rawContents), {
							schemaCheck: { enabled: false },
						});
					});
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
