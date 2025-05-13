import { createAudioData, createBeatmap, loadDifficulty, loadInfo, loadLightshow, saveAudioData, saveDifficulty, saveInfo, saveLightshow } from "bsmap";
import type { wrapper } from "bsmap/types";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { deserializeInfoContents } from "$/helpers/packaging.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { getSelectedBeatmap, resolveBeatmapIdFromFilename, resolveSongId } from "$/helpers/song.helpers";
import { filestore } from "$/setup";
import type { App, SongId } from "$/types";
import type { BeatmapFilestore } from "./file.service";

function getFileFromArchive(archive: JSZip, ...filenames: string[]) {
	// Ideally, our .zip archive will just have all the files we need.
	const allFilenamesInArchive = Object.keys(archive.files);
	for (const filename of filenames) {
		const matchingFilename = allFilenamesInArchive.find((name) => name.toString().toLowerCase() === filename.toLowerCase());
		if (matchingFilename) return archive.files[matchingFilename];
	}
	return null;
}

interface ZipOptions {
	version: ImplicitVersion | null;
	contents: {
		songId: SongId;
		beatmapsById: App.Beatmaps;
		songFile: Blob;
		coverArtFile: Blob;
		songDuration?: number;
	};
	options?: {
		minify?: boolean;
	};
}
export async function zipFiles(filestore: BeatmapFilestore, { version, contents, options }: ZipOptions) {
	const { songId, beatmapsById, songFile, coverArtFile } = contents;

	const indent = options?.minify ? 0 : 2;

	const zip = new JSZip();

	const wrapperInfo = await filestore.loadInfo(songId);

	const implicitInfoVersion = version ?? (wrapperInfo.version >= 0 ? wrapperInfo.version : 4);
	console.log(implicitInfoVersion);
	const info = saveInfo(wrapperInfo, (implicitInfoVersion === 3 ? 2 : implicitInfoVersion) as Extract<ImplicitVersion, 1 | 2 | 4>);

	zip.file(wrapperInfo.filename, JSON.stringify(info, null, indent), { binary: false });

	zip.file(wrapperInfo.audio.filename, songFile, { binary: true });
	zip.file(wrapperInfo.coverImageFilename, coverArtFile, { binary: true });

	const beatmapContents = await Promise.all(
		Object.values(beatmapsById).map(async (beatmap) => {
			const difficulty = await filestore.loadBeatmap(songId, beatmap.beatmapId);
			return { beatmap: difficulty };
		}),
	);

	for (const { beatmap: wrapper } of beatmapContents) {
		const implicitBeatmapVersion = version ?? (wrapper.version >= 0 ? wrapper.version : 4);
		const serialDifficulty = saveDifficulty(wrapper.difficulty, implicitBeatmapVersion as ImplicitVersion, {
			preprocess: [(data) => createBeatmap({ difficulty: data })],
		});
		zip.file(wrapper.filename, JSON.stringify(serialDifficulty, null, indent), {
			binary: false,
		});

		if (implicitBeatmapVersion === 4) {
			const serialLightshow = saveLightshow(wrapper.lightshow, implicitBeatmapVersion, {
				preprocess: [(data) => createBeatmap({ lightshow: data })],
			});
			zip.file(wrapper.lightshowFilename, JSON.stringify(serialLightshow, null, indent), {
				binary: false,
			});
		}
	}

	if (version === 4) {
		// HACK: since v4 requires audio data for serialization, we'll just shove this into the exported zip until we can add proper support for it :)
		const audioData = createAudioData({});
		const serialAudioData = saveAudioData(audioData, version, {});
		zip.file("AudioData.dat", JSON.stringify(serialAudioData, null, indent));
	}

	zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } }).then((blob) => {
		const timestamp = new Date().toISOString();
		const filename = `${songId}.${timestamp}.zip`;
		saveAs(blob, filename);
	});
}

export async function processImportedMap(zipFile: Parameters<typeof JSZip.loadAsync>[0], options: { currentSongIds?: SongId[]; readonly?: boolean }): Promise<App.Song> {
	// start by unzipping it
	const archive = await JSZip.loadAsync(zipFile);
	// pull the info file from the archive
	const infoFile = getFileFromArchive(archive, "Info.dat", "info.json");
	if (!infoFile) throw new Error("No info file.");
	const rawSerialInfo = await infoFile.async("string");
	// parse the info into the wrapper form
	const info = loadInfo(JSON.parse(rawSerialInfo));
	// parse the wrapper into the editor form
	const song = deserializeInfoContents(info, { readonly: options.readonly });
	const sid = resolveSongId(song);

	const songAlreadyExists = options.currentSongIds?.some((id) => id === sid);
	if (songAlreadyExists) {
		if (!window.confirm("This song appears to be a duplicate. Would you like to overwrite your existing song?")) {
			throw new Error("Sorry, you already have a song by this name");
		}
	}

	// save the info data (Not 100% sure that this is necessary, but better to have and not need)
	await filestore.saveInfo(sid, info);

	// save the assets - cover art and song file - to our local store
	const songFile = getFileFromArchive(archive, song.songFilename);
	const coverArtFile = getFileFromArchive(archive, song.coverArtFilename);
	if (!songFile || !coverArtFile) throw new Error("Missing required files");

	await Promise.all([
		await filestore.saveSongFile(sid, await songFile.async("blob"), "audio/ogg", song.songFilename),
		await filestore.saveCoverFile(sid, await coverArtFile.async("blob"), "image/jpeg", song.coverArtFilename),
		//
	]);

	// tackle the beatmaps and their entities (notes, obstacles, events).
	// we don't need to load the beatmaps into redux; we'll just write each of them to the filestore so that they can be loaded like any other song from the list.
	for (const beatmap of info.difficulties) {
		const beatmapId = resolveBeatmapIdFromFilename(beatmap.filename);
		const lightshowId = resolveBeatmapIdFromFilename(beatmap.lightshowFilename);

		let contents = { filename: `${beatmapId}.beatmap.dat`, lightshowFilename: `${lightshowId ?? "Unnamed"}.lightshow.dat` } as wrapper.IWrapBeatmap;

		const difficultyFile = getFileFromArchive(archive, beatmap.filename);
		if (difficultyFile) {
			const rawSerialDifficulty = await difficultyFile.async("string");
			const difficulty = loadDifficulty(JSON.parse(rawSerialDifficulty), {});
			contents = { ...contents, version: difficulty.version, difficulty: difficulty.difficulty, lightshow: difficulty.lightshow };
		}

		const lightshowFile = getFileFromArchive(archive, beatmap.lightshowFilename);
		if (lightshowFile) {
			const rawSerialLightshow = await lightshowFile.async("string");
			const lightshow = loadLightshow(JSON.parse(rawSerialLightshow), {});
			contents = { ...contents, lightshow: lightshow.lightshow };
		}

		await filestore.saveBeatmap(sid, beatmapId, createBeatmap(contents));
	}

	return {
		...song,
		selectedDifficulty: getSelectedBeatmap(song),
		createdAt: Date.now(),
	};
}
