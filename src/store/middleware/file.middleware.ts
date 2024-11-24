import { createListenerMiddleware } from "@reduxjs/toolkit";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { HIGHEST_PRECISION } from "$/constants";
import { getWaveformDataForFile } from "$/helpers/audio.helpers";
import { convertBookmarksToRedux } from "$/helpers/bookmarks.helpers";
import { convertEventsToExportableJson, convertEventsToRedux } from "$/helpers/events.helpers";
import { convertBlocksToRedux, convertMinesToRedux, convertNotesFromMappingExtensions } from "$/helpers/notes.helpers";
import { convertObstaclesToRedux } from "$/helpers/obstacles.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { createBeatmapContents, createInfoContent } from "$/services/packaging.service";
import { shiftEntitiesByOffset, unshiftEntitiesByOffset } from "$/services/packaging.service.nitty-gritty";
import { copyDifficulty, createDifficulty, deleteBeatmap, deleteSong, finishLoadingSong, loadBeatmapEntities, reloadWaveform, startLoadingSong, updateSongDetails } from "$/store/actions";
import { getSelectedSong, getSongById, selectAllBasicEvents } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { Json } from "$/types";
import { roundToNearest } from "$/utils";

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
			const song = getSongById(state, songId);
			if (!song) {
				console.error(`Song "${songId}" not found. Current state:`, state);
				return;
			}
			// Fetch the json for this beatmap from our local store.

			let beatmapJson: Json.Beatmap | null = null;
			try {
				beatmapJson = await filestore.loadBeatmapFile(songId, difficulty);
			} catch (err) {
				console.error(err);
			}
			if (beatmapJson) {
				let notes = beatmapJson._notes;
				if (song.modSettings.mappingExtensions?.isEnabled) {
					// If this song uses mapping extensions, the note values will be in the thousands. We need to pull them down to the normal range.
					notes = convertNotesFromMappingExtensions(notes);
				}
				// If we do, we need to manage a little dance related to offsets.
				// See offsets.md for more context, but essentially we need to transform our timing to match the beat, by undoing a transformation previously applied.
				let unshiftedNotes = unshiftEntitiesByOffset(notes.filter((x) => [0, 1].includes(x._type)) || [], song.offset, song.bpm);
				let unshiftedBombs = unshiftEntitiesByOffset(notes.filter((x) => [3].includes(x._type)) || [], song.offset, song.bpm);
				const unshiftedEvents = unshiftEntitiesByOffset(beatmapJson._events || [], song.offset, song.bpm);
				const unshiftedObstacles = unshiftEntitiesByOffset(beatmapJson._obstacles || [], song.offset, song.bpm);
				// Round all notes, so that no floating-point imprecision drift happens
				unshiftedNotes = unshiftedNotes.map((note) => {
					return { ...note, _time: roundToNearest(note._time, HIGHEST_PRECISION) };
				});
				unshiftedBombs = unshiftedBombs.map((note) => {
					return { ...note, _time: roundToNearest(note._time, HIGHEST_PRECISION) };
				});

				// Our beatmap comes in a "raw" form, using proprietary fields.
				// I need to convert the JSON format to something manageable.
				const convertedNotes = convertBlocksToRedux(unshiftedNotes);
				const convertedBombs = convertMinesToRedux(unshiftedBombs);
				const convertedObstacles = convertObstaclesToRedux(unshiftedObstacles);
				const convertedEvents = convertEventsToRedux(unshiftedEvents);
				const convertedBookmarks = beatmapJson._customData?._bookmarks ? convertBookmarksToRedux(beatmapJson._customData._bookmarks) : [];
				api.dispatch(loadBeatmapEntities({ notes: convertedNotes, bombs: convertedBombs, events: convertedEvents, obstacles: convertedObstacles, bookmarks: convertedBookmarks }));
			}
			api.dispatch(ReduxUndoActionCreators.clearHistory());
			const file = await filestore.loadFile<Blob>(song.songFilename);
			if (!file) return;
			const waveform = await getWaveformDataForFile(file);
			api.dispatch(finishLoadingSong({ song, waveformData: waveform }));
		},
	});
	instance.startListening({
		actionCreator: createDifficulty,
		effect: async (action, api) => {
			const { difficulty, afterCreate } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const events = convertEventsToExportableJson(selectAllBasicEvents(state));
			const shiftedEvents = shiftEntitiesByOffset(events, song.offset, song.bpm);
			// No notes/obstacles/bookmarks by default, but copy the lighting
			const beatmapContents = createBeatmapContents({ notes: [], obstacles: [], events: shiftedEvents, bookmarks: [] }, { version: 2 });
			await filestore.saveBeatmapFile(song.id, difficulty, beatmapContents);
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
			const song = getSongById(state, songId);
			// Back up our latest data!
			await filestore.saveInfoFile(song.id, createInfoContent(song, { version: 2 }));
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
		effect: async (action, api) => {
			const { id, songFilename, coverArtFilename, difficultiesById } = action.payload;
			await filestore.removeAllFilesForSong(id, songFilename, coverArtFilename, Object.keys(difficultiesById));
		},
	});

	return instance.middleware;
}
