import { createListenerMiddleware } from "@reduxjs/toolkit";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { getWaveformDataForFile } from "$/helpers/audio.helpers";
import { type PickBeatmapSerials, deserializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { resolveImplicitVersion } from "$/services/packaging.service.nitty-gritty";
import { copyDifficulty, createDifficulty, createNewSong, deleteBeatmap, deleteSong, finishLoadingSong, loadBeatmapEntities, reloadWaveform, startLoadingSong, updateSongDetails } from "$/store/actions";
import { selectAllBasicEvents, selectBeatmapById, selectDuration, selectIsModuleEnabled, selectOffsetInBeats, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { BeatmapId } from "$/types";
import { uniq } from "$/utils";

interface Options {
	filestore: BeatmapFilestore;
}
/** This middleware manages file storage concerns. */
export default function createFileMiddleware({ filestore }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: createNewSong.fulfilled,
		effect: async (action, api) => {
			const { songId: sid, selectedDifficulty: bid } = action.payload;
			const state = api.getState();

			const song = selectSongById(state, sid);

			// we'll always use the latest supported beatmap format
			const infoContents = serializeInfoContents(4, song, {});
			// song/cover files are already stored via the dispatched action, so we just need to populate the info/beatmap/lightshow contents
			await filestore.saveInfoFile(sid, infoContents);
			await filestore.saveDifficultyFile(sid, bid, { version: "4.0.0" });
			await filestore.saveLightshowFile(sid, "Common", { version: "4.0.0" });
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

			// Fetch the json for this beatmap from our local store.
			const contents = { difficulty: {}, lightshow: undefined } as PickBeatmapSerials<"difficulty" | "lightshow">;
			const difficulty = await filestore.loadDifficultyFile(songId, beatmap.beatmapId);
			contents.difficulty = difficulty;

			if (beatmap.lightshowId) {
				const lightshow = await filestore.loadLightshowFile(songId, beatmap.lightshowId);
				contents.lightshow = lightshow;
			}

			// Our beatmap comes in a "raw" form, using proprietary fields.
			// I need to convert the JSON format to something manageable.
			console.log(difficulty);
			const version = resolveImplicitVersion(difficulty, 2);
			const entities = deserializeBeatmapContents(version, contents, {
				editorOffsetInBeats,
				extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
			});
			api.dispatch(loadBeatmapEntities(entities));

			api.dispatch(ReduxUndoActionCreators.clearHistory());
			const song = selectSongById(state, songId);
			const file = await filestore.loadFile<Blob>(song.songFilename);
			const waveform = await getWaveformDataForFile(file);
			api.dispatch(finishLoadingSong({ songId: song.id, songData: song, waveformData: waveform }));
		},
	});
	instance.startListening({
		actionCreator: createDifficulty,
		effect: async (action, api) => {
			const { songId, beatmapId, afterCreate } = action.payload;
			const state = api.getState();
			const beatmap = selectBeatmapById(state, songId, beatmapId);

			const editorOffsetInBeats = selectOffsetInBeats(state, songId);
			const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");

			const entities = { events: selectAllBasicEvents(state) };
			// No notes/obstacles/bookmarks by default, but copy the lighting
			await filestore.updateBeatmapContents(songId, beatmap.beatmapId, beatmap.lightshowId, entities, {
				serializationOptions: {
					editorOffsetInBeats,
					extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
				},
				deserializationOptions: {
					editorOffsetInBeats,
					extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
				},
			});

			if (typeof afterCreate === "function") {
				afterCreate(beatmapId);
			}
		},
	});
	instance.startListening({
		actionCreator: copyDifficulty,
		effect: async (action, api) => {
			const { songId, fromBeatmapId, toBeatmapId, afterCopy } = action.payload;
			const state = api.getState();
			const duration = selectDuration(state);

			const source = selectBeatmapById(state, songId, fromBeatmapId);
			const target = selectBeatmapById(state, songId, toBeatmapId);

			// First, we need to load the file which contains the notes, events, etc for the difficulty we want to copy.
			const sourceDifficultyFileContents = await filestore.loadDifficultyFile(songId, source.beatmapId);
			// Save it to our destination difficulty.
			await filestore.saveDifficultyFile(songId, target.beatmapId, sourceDifficultyFileContents);

			if (source.lightshowId && target.lightshowId && source.lightshowId !== target.lightshowId) {
				const sourceLightshowFileContents = await filestore.loadLightshowFile(songId, source.lightshowId).catch(() => null);
				if (sourceLightshowFileContents) await filestore.saveLightshowFile(songId, target.lightshowId, sourceLightshowFileContents);
			}

			// Pull that updated redux state and save it to our Info.dat
			const song = selectSongById(state, songId);

			// Back up our latest data!
			await filestore.updateInfoContents(song.id, song, {
				serializationOptions: { songDuration: duration ? duration / 1000 : undefined },
				deserializationOptions: {},
			});
			if (typeof afterCopy === "function") {
				afterCopy(toBeatmapId);
			}
		},
	});
	instance.startListening({
		actionCreator: updateSongDetails,
		effect: async (action, api) => {
			const { songFilename } = action.payload;
			// It's possible we updated the song file. We should reload it, so that the waveform is properly updated.
			if (songFilename) {
				const file = await filestore.loadFile<Blob>(songFilename);
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
			await filestore.removeFile(BeatmapFilestore.resolveFilename(songId, "difficulty", { id: beatmapId }));
		},
	});
	instance.startListening({
		actionCreator: deleteSong,
		effect: async (action) => {
			const { id, songFilename, coverArtFilename, difficultiesById } = action.payload;
			const beatmapIds = uniq(Object.values(difficultiesById).map((beatmap) => beatmap.beatmapId));
			const lightshowIds = uniq(
				Object.values(difficultiesById)
					.map((beatmap) => beatmap.lightshowId)
					.filter((x) => !!x) as BeatmapId[],
			);
			await filestore.removeAllFilesForSong(id, songFilename, coverArtFilename, beatmapIds, lightshowIds);
		},
	});

	return instance.middleware;
}
