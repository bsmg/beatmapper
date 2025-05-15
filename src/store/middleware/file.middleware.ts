import { createListenerMiddleware } from "@reduxjs/toolkit";
import { createBeatmap } from "bsmap";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { deriveAudioDataFromFile, deriveWaveformDataFromFile } from "$/helpers/audio.helpers";
import { type BeatmapSerializationOptions, type InfoSerializationOptions, deserializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { resolveBeatmapId } from "$/helpers/song.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { copyDifficulty, createDifficulty, createNewSong, deleteBeatmap, deleteSong, finishLoadingSong, loadBeatmapEntities, reloadWaveform, startLoadingSong, updateBeatmapMetadata, updateSongDetails } from "$/store/actions";
import { selectActiveBeatmapId, selectBeatmapIdsWithLightshowId, selectDuration, selectEditorOffsetInBeats, selectIsModuleEnabled, selectLightshowIdForBeatmap, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";

export function selectInfoSerializationOptionsFromState(state: RootState, _songId: SongId): InfoSerializationOptions {
	const duration = selectDuration(state);
	return {
		songDuration: duration ? duration / 1000 : undefined,
	};
}
export function selectBeatmapSerializationOptionsFromState(state: RootState, songId: SongId): BeatmapSerializationOptions {
	const editorOffsetInBeats = selectEditorOffsetInBeats(state, songId);
	const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");
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

	async function updateAudioContentsFromFile(songId: SongId, filestore: BeatmapFilestore, songFile: File) {
		const [{ duration, frequency, sampleCount }, { version }] = await Promise.all([deriveAudioDataFromFile(songFile), filestore.loadInfoContents(songId)]);

		const { filename, contents } = await filestore.updateAudioContents(songId, {
			version: version,
			frequency,
			sampleCount,
		});
		return { duration, filename, contents };
	}

	instance.startListening({
		actionCreator: createNewSong.fulfilled,
		effect: async (action, api) => {
			const { songId, beatmapData } = action.payload;
			const state = api.getState();

			// pull the updated state from the redux layer
			const song = selectSongById(state, songId);
			// convert it to the serial wrapper data
			const infoContents = serializeInfoContents(song, selectInfoSerializationOptionsFromState(state, songId));
			// store the song data in the filestore
			await filestore.saveInfoContents(songId, {
				...infoContents,
				version: 4, // we'll fallback to v4 by default, since this is the latest supported beatmap version
			});

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
		actionCreator: startLoadingSong,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();

			// fetch the metadata for this beatmap from our local store
			const beatmapContents = await filestore.loadBeatmapContents(songId, beatmapId);
			// deserialize the metadata into editor-compatible wrappers
			const entities = deserializeBeatmapContents(beatmapContents, selectBeatmapSerializationOptionsFromState(state, songId));

			api.dispatch(loadBeatmapEntities({ ...entities }));

			api.dispatch(ReduxUndoActionCreators.clearHistory());

			const [songFile, currentAudioData] = await Promise.all([filestore.loadSongFile(songId), filestore.loadAudioDataContents(songId)]);
			// only update audio data if it's not already present (typically applies for imported maps).
			if (!currentAudioData) {
				await updateAudioContentsFromFile(songId, filestore, songFile);
			}

			const [{ duration }, waveformData] = await Promise.all([deriveAudioDataFromFile(songFile), deriveWaveformDataFromFile(songFile)]);

			api.dispatch(finishLoadingSong({ songId: songId, songData: selectSongById(state, songId), duration, waveformData: waveformData.toJSON() }));
		},
	});
	instance.startListening({
		actionCreator: updateSongDetails,
		effect: async (action, api) => {
			const { songId, songData } = action.payload;
			const state = api.getState();

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);

			// It's possible we updated the song file. We should reload it, so that the waveform is properly updated.
			if (songData.songFilename) {
				// always update audio contents when the song file is updated, since sample count and frequency could potentially change.
				const songFile = await filestore.loadSongFile(songId);
				const [{ duration }, waveformData] = await Promise.all([deriveAudioDataFromFile(songFile), deriveWaveformDataFromFile(songFile)]);
				await updateAudioContentsFromFile(songId, filestore, songFile);

				api.dispatch(reloadWaveform({ duration, waveformData: waveformData.toJSON() }));
			}
		},
	});
	instance.startListening({
		actionCreator: deleteSong,
		effect: async (action) => {
			const { songId, beatmapIds } = action.payload;
			await filestore.removeAllFilesForSong(songId, beatmapIds);
		},
	});
	instance.startListening({
		actionCreator: createDifficulty,
		effect: async (action, api) => {
			const { songId, beatmapId, lightshowId } = action.payload;
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
					lightshowFilename: `${lightshowId && lightshowId !== "Unnamed" ? lightshowId : beatmapId}.lightshow.dat`,
				}),
			);

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);
		},
	});
	instance.startListening({
		actionCreator: copyDifficulty,
		effect: async (action, api) => {
			const { songId, fromBeatmapId: sourceBeatmapId, toBeatmapId: targetBeatmapId } = action.payload;
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
		actionCreator: updateBeatmapMetadata,
		effect: async (action, api) => {
			const { songId, beatmapId, beatmapData } = action.payload;
			const state = api.getState();

			// reference a beatmap that has the same lightshow id as the one provided via form data
			const beatmapIdWithLightshow = selectBeatmapIdsWithLightshowId(state, songId, beatmapData.lightshowId)[0];
			// extract the lightshow data from the derived beatmap file
			const { lightshow } = await filestore.loadBeatmapContents(songId, beatmapIdWithLightshow);
			// update the beatmap with the new lightshow data
			await filestore.updateBeatmapContents(songId, beatmapId, {
				lightshow,
				// override the lightshow filename with the new id
				lightshowFilename: `${beatmapData.lightshowId}.lightshow.dat`,
			});

			// Pull that updated redux state and save it to our Info.dat
			const info = serializeInfoContents(selectSongById(state, songId), selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);
		},
	});
	instance.startListening({
		actionCreator: deleteBeatmap,
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
