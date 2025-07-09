import { createListenerMiddleware } from "@reduxjs/toolkit";
import { createBeatmap } from "bsmap";
import type { wrapper } from "bsmap/types";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { convertMillisecondsToBeats, deriveAudioDataFromFile, deriveWaveformDataFromFile } from "$/helpers/audio.helpers";
import { type BeatmapSerializationOptions, type InfoSerializationOptions, deserializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { resolveBeatmapId } from "$/helpers/song.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { addBeatmap, addSong, copyBeatmap, finishLoadingMap, leaveEditor, loadBeatmapEntities, reloadVisualizer, removeBeatmap, removeSong, startLoadingMap, updateBeatmap, updateSong } from "$/store/actions";
import { selectActiveBeatmapId, selectBeatmapIdsWithLightshowId, selectDuration, selectEditorOffsetInBeats, selectLightshowIdForBeatmap, selectModuleEnabled, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, SongId } from "$/types";
import { deepMerge } from "$/utils";

export function selectInfoSerializationOptionsFromState(state: RootState, _songId: SongId): InfoSerializationOptions {
	const duration = selectDuration(state);
	return {
		songDuration: duration ? duration / 1000 : undefined,
	};
}
export function selectBeatmapSerializationOptionsFromState(state: RootState, songId: SongId): BeatmapSerializationOptions {
	const editorOffsetInBeats = selectEditorOffsetInBeats(state, songId);
	const isExtensionsEnabled = selectModuleEnabled(state, songId, "mappingExtensions");
	return {
		editorOffsetInBeats,
		extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
	};
}

interface Options {
	filestore: BeatmapFilestore;
}
/** This middleware manages file storage concerns. */
export default function createFileMiddleware({ filestore }: Options) {
	const instance = createListenerMiddleware<RootState>();
	const audioContext = new AudioContext();

	async function createAudioDataContentsFromFile(songId: SongId, filestore: BeatmapFilestore, songFile: File, { bpm }: Pick<App.ISong, "bpm">) {
		const { duration, frequency, sampleCount } = await deriveAudioDataFromFile(songFile, audioContext);

		// map will not load properly in-game if there isn't at least one bpm change defined. we call this peak stupid.
		const region: wrapper.IWrapAudioDataBPM = {
			startSampleIndex: 0,
			endSampleIndex: sampleCount,
			startBeat: 0,
			endBeat: convertMillisecondsToBeats(duration * 1000, bpm),
		};

		const { filename, contents } = await filestore.updateAudioDataContents(songId, { version: 4, frequency, sampleCount, bpmData: [region] });

		return { duration, filename, contents };
	}

	instance.startListening({
		actionCreator: addSong,
		effect: async (action, api) => {
			const { songId, songData, beatmapData, songFile, coverArtFile } = action.payload;
			const state = api.getState();

			const { duration, contents: audioDataContents } = await createAudioDataContentsFromFile(songId, filestore, songFile, { bpm: songData.bpm });

			// pull the updated state from the redux layer
			const song = selectSongById(state, songId);
			// convert it to the serial wrapper data
			const infoContents = serializeInfoContents(song, selectInfoSerializationOptionsFromState(state, songId));
			// store the info data in the filestore
			const { contents: newInfoContents } = await filestore.saveInfoContents(
				songId,
				deepMerge(infoContents, {
					version: 4, // we'll fallback to v4 by default, since this is the latest supported beatmap version
					audio: { duration }, // pull the duration value in, since we don't provide this from the state directly
				}),
			);

			// store song/cover files in the filestore
			await Promise.all([await filestore.saveSongFile(songId, songFile), await filestore.saveCoverArtFile(songId, coverArtFile)]);

			// store the audio data in the filestore
			await filestore.saveAudioDataContents(songId, deepMerge(audioDataContents, { version: newInfoContents.version }));

			// derive the beatmap id from the provided beatmap data within the payload
			const beatmapId = resolveBeatmapId({ characteristic: beatmapData.characteristic, difficulty: beatmapData.difficulty });
			// create initialized beatmap data for the filestore
			await filestore.saveBeatmapContents(
				songId,
				beatmapId,
				createBeatmap({
					version: 4, // we'll fallback to v4 by default, since this is the latest supported beatmap version
					filename: `${beatmapId}.beatmap.dat`,
					lightshowFilename: `${beatmapId}.lightshow.dat`,
				}),
			);
		},
	});
	instance.startListening({
		actionCreator: startLoadingMap,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();
			const song = selectSongById(state, songId);

			// fetch the metadata for this beatmap from our local store
			const beatmapContents = await filestore.loadBeatmapContents(songId, beatmapId);
			// pull the lightshow data from any beatmap with a matching lightshow id
			const lightshowId = selectLightshowIdForBeatmap(state, songId, beatmapId);
			const derivedBeatmapId = selectBeatmapIdsWithLightshowId(state, songId, lightshowId).find((x) => x !== beatmapId);
			if (derivedBeatmapId) {
				const { lightshow: sharedLightshow } = await filestore.loadBeatmapContents(songId, derivedBeatmapId);
				beatmapContents.lightshow = sharedLightshow;
			}
			// deserialize the metadata into editor-compatible wrappers
			const entities = deserializeBeatmapContents(beatmapContents, selectBeatmapSerializationOptionsFromState(state, songId));

			api.dispatch(loadBeatmapEntities({ ...entities }));

			const [songFile, currentAudioDataContents] = await Promise.all([filestore.loadSongFile(songId), filestore.loadAudioDataContents(songId)]);
			// only update audio data if it's not already present (typically applies for imported maps).
			if (!currentAudioDataContents || currentAudioDataContents.bpmData.length === 0) {
				await createAudioDataContentsFromFile(songId, filestore, songFile, { bpm: song.bpm });
			}

			const [{ duration }, waveformData] = await Promise.all([deriveAudioDataFromFile(songFile, audioContext), deriveWaveformDataFromFile(songFile, audioContext)]);
			api.dispatch(finishLoadingMap({ songId: songId, songData: selectSongById(state, songId), duration, waveformData: waveformData.toJSON() }));
		},
	});
	instance.startListening({
		actionCreator: leaveEditor,
		effect: (_, api) => {
			api.dispatch(ReduxUndoActionCreators.clearHistory());
		},
	});
	instance.startListening({
		actionCreator: updateSong,
		effect: async (action, api) => {
			const { songId, changes: songData } = action.payload;
			const state = api.getState();
			const song = selectSongById(state, songId);

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);

			// It's possible we updated the song file. We should reload it, so that the waveform is properly updated.
			if (songData.bpm || songData.songFilename) {
				// always update audio contents when the song file is updated, since sample count and frequency could potentially change.
				const songFile = await filestore.loadSongFile(songId);
				await createAudioDataContentsFromFile(songId, filestore, songFile, { bpm: songData.bpm ?? song.bpm });

				const [{ duration }, waveformData] = await Promise.all([deriveAudioDataFromFile(songFile, audioContext), deriveWaveformDataFromFile(songFile, audioContext)]);
				api.dispatch(reloadVisualizer({ duration, waveformData: waveformData.toJSON() }));
			}
		},
	});
	instance.startListening({
		actionCreator: removeSong,
		effect: async (action) => {
			const { id: songId, beatmapIds } = action.payload;
			await filestore.removeAllFilesForSong(songId, beatmapIds);
		},
	});
	instance.startListening({
		actionCreator: addBeatmap,
		effect: async (action, api) => {
			const { songId, beatmapId, data } = action.payload;
			const state = api.getState();

			// we need to reference the currently selected beatmap to supply the correct serial version for the filestore
			const activeBeatmapId = selectActiveBeatmapId(state);
			if (!activeBeatmapId) throw new Error("Could not reference active beatmap.");
			// grab the implicit version from the source data, so we can keep all related files on the same version
			const version = await filestore.loadImplicitVersion(songId, activeBeatmapId);
			// save it to our destination file
			await filestore.saveBeatmapContents(
				songId,
				beatmapId,
				createBeatmap({
					version: version,
					filename: `${beatmapId}.beatmap.dat`,
					lightshowFilename: `${data.lightshowId && data.lightshowId !== "Unnamed" ? data.lightshowId : beatmapId}.lightshow.dat`,
				}),
			);

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);
		},
	});
	instance.startListening({
		actionCreator: copyBeatmap,
		effect: async (action, api) => {
			const { songId, sourceBeatmapId, targetBeatmapId } = action.payload;
			const state = api.getState();

			// grab the implicit version from the source data, so we can keep all related files on the same version
			const version = await filestore.loadImplicitVersion(songId, sourceBeatmapId);
			// grab all related collections from the source
			const { difficulty, lightshow, customData } = await filestore.loadBeatmapContents(songId, sourceBeatmapId);
			// pull the lightshow id from the source (since we're deriving that data anyway)
			const lightshowId = selectLightshowIdForBeatmap(state, songId, sourceBeatmapId);
			// save it to our destination
			await filestore.saveBeatmapContents(
				songId,
				targetBeatmapId,
				createBeatmap({
					version: version,
					filename: `${targetBeatmapId}.beatmap.dat`,
					lightshowFilename: `${lightshowId && lightshowId !== "Unnamed" ? lightshowId : targetBeatmapId}.lightshow.dat`,
					difficulty,
					lightshow,
					customData,
				}),
			);

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);
		},
	});
	instance.startListening({
		actionCreator: updateBeatmap,
		effect: async (action, api) => {
			const { songId, beatmapId, changes: beatmapData } = action.payload;
			const state = api.getState();

			if (beatmapData.lightshowId) {
				// reference a beatmap that has the same lightshow id as the one provided via form data
				const derivedBeatmapId = selectBeatmapIdsWithLightshowId(state, songId, beatmapData.lightshowId)[0];
				// extract the lightshow data from the derived beatmap file
				const { lightshow } = await filestore.loadBeatmapContents(songId, derivedBeatmapId);
				// update the beatmap with the new lightshow data
				await filestore.updateBeatmapContents(songId, beatmapId, {
					lightshow,
					// override the lightshow filename with the new id
					lightshowFilename: `${beatmapData.lightshowId}.lightshow.dat`,
				});
			}

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);
		},
	});
	instance.startListening({
		actionCreator: removeBeatmap,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();

			// Our reducer will handle the redux state part, but we also need to delete the corresponding beatmap from the filesystem.
			await filestore.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId }));

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);
		},
	});

	return instance.middleware;
}
