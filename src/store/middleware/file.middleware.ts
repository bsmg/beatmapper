import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { v2 } from "bsmap/types";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { getWaveformDataForFile } from "$/helpers/audio.helpers";
import { deserializeCustomBookmark } from "$/helpers/bookmarks.helpers";
import { convertEventsToRedux } from "$/helpers/events.helpers";
import { deserializeBombNote, deserializeColorNote } from "$/helpers/notes.helpers";
import { deserializeObstacle } from "$/helpers/obstacles.helpers";
import { serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { unshiftEntitiesByOffset } from "$/services/packaging.service.nitty-gritty";
import { copyDifficulty, createDifficulty, deleteBeatmap, deleteSong, finishLoadingSong, loadBeatmapEntities, reloadWaveform, startLoadingSong, updateSongDetails } from "$/store/actions";
import { selectAllBasicEvents, selectOffsetInBeats, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";

interface Options {
	filestore: BeatmapFilestore;
}
/** This middleware manages file storage concerns. */
export default function createFileMiddleware({ filestore }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: startLoadingSong,
		effect: async (action, api) => {
			const { songId, difficulty } = action.payload;
			const state = api.getState();
			const song = selectSongById(state, songId);
			if (!song) {
				console.error(`Song "${songId}" not found. Current state:`, state);
				return;
			}
			// Fetch the json for this beatmap from our local store.

			let beatmapJson: v2.IDifficulty | null = null;
			try {
				beatmapJson = await filestore.loadBeatmapFile(songId, difficulty);
			} catch (err) {
				console.error(err);
			}
			if (beatmapJson) {
				const extensionsProvider = song.modSettings.mappingExtensions?.isEnabled ? "mapping-extensions" : undefined;
				const notes = beatmapJson._notes ?? [];
				// If we do, we need to manage a little dance related to offsets.
				// See offsets.md for more context, but essentially we need to transform our timing to match the beat, by undoing a transformation previously applied.
				const unshiftedNotes = unshiftEntitiesByOffset(notes.filter((x) => [0, 1].includes(x._type ?? 0)) || [], song.offset, song.bpm);
				const unshiftedBombs = unshiftEntitiesByOffset(notes.filter((x) => [3].includes(x._type ?? 0)) || [], song.offset, song.bpm);
				const unshiftedEvents = unshiftEntitiesByOffset(beatmapJson._events || [], song.offset, song.bpm);
				const unshiftedObstacles = unshiftEntitiesByOffset(beatmapJson._obstacles || [], song.offset, song.bpm);

				// Our beatmap comes in a "raw" form, using proprietary fields.
				// I need to convert the JSON format to something manageable.
				const convertedNotes = unshiftedNotes.map((o) => deserializeColorNote(2, o, { extensionsProvider: extensionsProvider }));
				const convertedBombs = unshiftedBombs.map((o) => deserializeBombNote(2, o, { extensionsProvider: extensionsProvider }));
				const convertedObstacles = unshiftedObstacles.map((o) => deserializeObstacle(2, o, { extensionsProvider: extensionsProvider }));
				const convertedEvents = convertEventsToRedux(unshiftedEvents);
				const convertedBookmarks = beatmapJson._customData?._bookmarks?.map((o) => deserializeCustomBookmark(2, o, {}));
				api.dispatch(loadBeatmapEntities({ notes: convertedNotes, bombs: convertedBombs, events: convertedEvents, obstacles: convertedObstacles, bookmarks: convertedBookmarks }));
			}
			api.dispatch(ReduxUndoActionCreators.clearHistory());
			const file = await filestore.loadFile<Blob>(song.songFilename);
			if (!file) return;
			const waveform = await getWaveformDataForFile(file);
			api.dispatch(finishLoadingSong({ songId: song.id, songData: song, waveformData: waveform }));
		},
	});
	instance.startListening({
		actionCreator: createDifficulty,
		effect: async (action, api) => {
			const { songId, difficulty, afterCreate } = action.payload;
			const state = api.getState();
			const editorOffsetInBeats = selectOffsetInBeats(state, songId);
			const events = selectAllBasicEvents(state);
			// No notes/obstacles/bookmarks by default, but copy the lighting
			const { difficulty: beatmapContents } = serializeBeatmapContents(2, { notes: [], obstacles: [], events: events, bookmarks: [] }, { editorOffsetInBeats });
			await filestore.saveBeatmapFile(songId, difficulty, beatmapContents);
			if (typeof afterCreate === "function") {
				afterCreate(difficulty);
			}
		},
	});
	instance.startListening({
		actionCreator: copyDifficulty,
		effect: async (action, api) => {
			const state = api.getState();
			const { songId, fromDifficultyId, toDifficultyId, afterCopy } = action.payload;
			// First, we need to load the file which contains the notes, events, etc for the difficulty we want to copy.
			const sourceDifficultyFileContents = await filestore.loadBeatmapFile(songId, fromDifficultyId);
			if (!sourceDifficultyFileContents) throw new Error(`No beatmap found for ${songId}/${fromDifficultyId}`);
			// Save it to our destination difficulty.
			await filestore.saveBeatmapFile(songId, toDifficultyId, sourceDifficultyFileContents);
			// Pull that updated redux state and save it to our Info.dat
			const song = selectSongById(state, songId);
			// Back up our latest data!
			await filestore.saveInfoFile(song.id, serializeInfoContents(2, song, {}));
			if (typeof afterCopy === "function") {
				afterCopy(toDifficultyId);
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
				if (!file) return;
				const waveform = await getWaveformDataForFile(file);
				api.dispatch(reloadWaveform({ waveformData: waveform }));
			}
		},
	});
	instance.startListening({
		actionCreator: deleteBeatmap,
		effect: async (action) => {
			const { songId, difficulty } = action.payload;
			// Our reducer will handle the redux state part, but we also need to delete the corresponding beatmap from the filesystem.
			await filestore.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: difficulty }));
		},
	});
	instance.startListening({
		actionCreator: deleteSong,
		effect: async (action) => {
			const { id, songFilename, coverArtFilename, difficultiesById } = action.payload;
			await filestore.removeAllFilesForSong(id, songFilename, coverArtFilename, Object.keys(difficultiesById));
		},
	});

	return instance.middleware;
}
