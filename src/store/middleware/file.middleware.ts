import { createListenerMiddleware } from "@reduxjs/toolkit";
import { createBeatmap } from "bsmap";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { getWaveformDataForFile } from "$/helpers/audio.helpers";
import { deserializeWrapBeatmapContents, serializeWrapBeatmapContents, serializeWrapInfoContents } from "$/helpers/packaging.helpers";
import { resolveBeatmapId } from "$/helpers/song.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { copyDifficulty, createDifficulty, createNewSong, deleteBeatmap, deleteSong, finishLoadingSong, loadBeatmapEntities, reloadWaveform, startLoadingSong, updateSongDetails } from "$/store/actions";
import { selectActiveBeatmapId, selectAllBasicEvents, selectBeatmapById, selectDuration, selectIsModuleEnabled, selectOffsetInBeats, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";

interface Options {
	filestore: BeatmapFilestore;
}
/** This middleware manages file storage concerns. */
export default function createFileMiddleware({ filestore }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: createNewSong.fulfilled,
		effect: async (action, api) => {
			const { songId: sid, selectedCharacteristic: characteristic, selectedDifficulty: difficulty } = action.payload;
			const state = api.getState();

			const song = selectSongById(state, sid);

			const beatmapId = resolveBeatmapId({ characteristic, difficulty });

			const infoContents = serializeWrapInfoContents(song, {});
			// song/cover files are already stored via the dispatched action, so we just need to populate the info/beatmap/lightshow contents

			await filestore.saveInfo(sid, infoContents);

			await filestore.saveBeatmap(
				sid,
				beatmapId,
				createBeatmap({
					filename: `${beatmapId}.beatmap.dat`,
					lightshowFilename: "Common.lightshow.dat",
				}),
			);
		},
	});
	instance.startListening({
		actionCreator: startLoadingSong,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();

			const beatmap = selectBeatmapById(state, songId, beatmapId);

			const editorOffsetInBeats = selectOffsetInBeats(state, songId);
			const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");

			// Fetch the metadata for this beatmap from our local store.
			const wrapBeatmap = await filestore.loadBeatmap(songId, beatmap.beatmapId);

			// all metadata items are serialized as wrapper forms in the filestore
			const entities = deserializeWrapBeatmapContents(wrapBeatmap, {
				editorOffsetInBeats,
				extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
			});
			api.dispatch(loadBeatmapEntities(entities));

			api.dispatch(ReduxUndoActionCreators.clearHistory());
			const song = selectSongById(state, songId);
			const file = await filestore.loadSongFile(songId);
			const waveform = await getWaveformDataForFile(file);
			api.dispatch(finishLoadingSong({ songId: song.id, songData: song, waveformData: waveform }));
		},
	});
	instance.startListening({
		actionCreator: createDifficulty,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();

			const editorOffsetInBeats = selectOffsetInBeats(state, songId);
			const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");

			// we need to reference the currently selected song to supply the correct serial version for the filestore.
			const activeBeatmapId = selectActiveBeatmapId(state);
			if (!activeBeatmapId) throw new Error("Could not reference active beatmap.");

			const entities = { events: selectAllBasicEvents(state) };

			const serialized = serializeWrapBeatmapContents(entities, {
				editorOffsetInBeats,
				extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
			});
			await filestore.saveBeatmap(songId, beatmapId, serialized);

			// Pull that updated redux state and save it to our Info.dat
			const song = selectSongById(state, songId);
			const duration = selectDuration(state);
			// Back up our latest data!
			await filestore.updateInfoContents(song.id, song, {
				serializationOptions: { songDuration: duration ? duration / 1000 : undefined },
				deserializationOptions: {},
			});
		},
	});
	instance.startListening({
		actionCreator: copyDifficulty,
		effect: async (action, api) => {
			const { songId, fromBeatmapId, toBeatmapId } = action.payload;
			const state = api.getState();

			const source = selectBeatmapById(state, songId, fromBeatmapId);
			const target = selectBeatmapById(state, songId, toBeatmapId);

			// First, we need to load the file which contains the notes, events, etc for the difficulty we want to copy.
			const sourceDifficultyFileContents = await filestore.loadBeatmap(songId, source.beatmapId);
			// Save it to our destination difficulty.
			await filestore.saveBeatmap(songId, target.beatmapId, sourceDifficultyFileContents);

			// Pull that updated redux state and save it to our Info.dat
			const song = selectSongById(state, songId);
			const duration = selectDuration(state);
			// Back up our latest data!
			await filestore.updateInfoContents(song.id, song, {
				serializationOptions: { songDuration: duration ? duration / 1000 : undefined },
				deserializationOptions: {},
			});
		},
	});
	instance.startListening({
		actionCreator: updateSongDetails,
		effect: async (action, api) => {
			const { songId, songFilename } = action.payload;
			// It's possible we updated the song file. We should reload it, so that the waveform is properly updated.
			if (songFilename) {
				const file = await filestore.loadSongFile(songId);
				const waveform = await getWaveformDataForFile(file);
				api.dispatch(reloadWaveform({ waveformData: waveform }));
			}
		},
	});
	instance.startListening({
		actionCreator: deleteBeatmap,
		effect: async (action) => {
			const { songId, beatmapId } = action.payload;
			// Our reducer will handle the redux state part, but we also need to delete the corresponding beatmap from the filesystem.
			await filestore.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId }));
		},
	});
	instance.startListening({
		actionCreator: deleteSong,
		effect: async (action) => {
			const { id, difficultiesById } = action.payload;
			await filestore.removeAllFilesForSong(id, Object.keys(difficultiesById));
		},
	});

	return instance.middleware;
}
