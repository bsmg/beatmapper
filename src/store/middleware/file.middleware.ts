import { createListenerMiddleware } from "@reduxjs/toolkit";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { HIGHEST_PRECISION } from "$/constants";
import { getWaveformDataForFile } from "$/helpers/audio.helpers";
import { convertBookmarksToRedux } from "$/helpers/bookmarks.helpers";
import { convertEventsToExportableJson, convertEventsToRedux } from "$/helpers/events.helpers";
import { convertNotesFromMappingExtensions } from "$/helpers/notes.helpers";
import { convertObstaclesToRedux } from "$/helpers/obstacles.helpers";
import { FileType, deleteAllSongFiles, deleteFile, getBeatmap, getFile, getFilenameForThing, saveBeatmap, saveFile, saveInfoDat } from "$/services/file.service";
import { createBeatmapContents, createInfoContent } from "$/services/packaging.service";
import { shiftEntitiesByOffset, unshiftEntitiesByOffset } from "$/services/packaging.service.nitty-gritty";
import { copyDifficulty, createDifficulty, deleteBeatmap, deleteSong, finishLoadingSong, loadBeatmapEntities, reloadWaveform, startLoadingSong, updateSongDetails } from "$/store/actions";
import { getAllEventsAsArray, getSelectedSong, getSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { Json } from "$/types";
import { roundToNearest } from "$/utils";

/** This middleware manages file storage concerns. */
export default function createFileMiddleware() {
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
				beatmapJson = await getBeatmap(songId, difficulty);
			} catch (err) {
				console.error(err);
			}
			// we may not have any beatmap entities, if this is a new song or new difficulty.
			if (beatmapJson) {
				let notes = beatmapJson._notes;
				// If this song uses mapping extensions, the note values will be in the thousands. We need to pull them down to the normal range.
				if (song.modSettings.mappingExtensions?.isEnabled) {
					notes = convertNotesFromMappingExtensions(notes);
				}
				// If we do, we need to manage a little dance related to offsets.
				// See offsets.md for more context, but essentially we need to transform our timing to match the beat, by undoing a transformation previously applied.
				let unshiftedNotes = unshiftEntitiesByOffset(notes || [], song.offset, song.bpm);
				const unshiftedEvents = unshiftEntitiesByOffset(beatmapJson._events || [], song.offset, song.bpm);
				const unshiftedObstacles = unshiftEntitiesByOffset(beatmapJson._obstacles || [], song.offset, song.bpm);
				// Round all notes, so that no floating-point imprecision drift happens
				unshiftedNotes = unshiftedNotes.map((note) => {
					return { ...note, _time: roundToNearest(note._time, HIGHEST_PRECISION) };
				});
				// Our beatmap comes in a "raw" form, using proprietary fields.
				// At present, I'm using that proprietary structure for notes/mines, but I have my own structure for obstacles and events.
				// So I need to convert the ugly JSON format to something manageable.
				const convertedObstacles = convertObstaclesToRedux(unshiftedObstacles as Json.Obstacle[]);
				const convertedEvents = convertEventsToRedux(unshiftedEvents as Json.Event[]);
				const convertedBookmarks = beatmapJson._customData?._bookmarks ? convertBookmarksToRedux(beatmapJson._customData._bookmarks) : [];
				api.dispatch(loadBeatmapEntities({ notes: unshiftedNotes as Json.Note[], events: convertedEvents, obstacles: convertedObstacles, bookmarks: convertedBookmarks }));
				api.dispatch(ReduxUndoActionCreators.clearHistory());
			}
			const file = await getFile<Blob>(song.songFilename);
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
			const events = convertEventsToExportableJson(getAllEventsAsArray(state));
			const shiftedEvents = shiftEntitiesByOffset(events, song.offset, song.bpm);
			// No notes/obstacles/bookmarks by default, but copy the lighting
			const beatmapContents = createBeatmapContents({ notes: [], obstacles: [], events: shiftedEvents, bookmarks: [] }, { version: 2 });
			const beatmapFilename = getFilenameForThing(song.id, FileType.BEATMAP, { difficulty });
			await saveFile(beatmapFilename, beatmapContents);
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
			const sourceDifficultyFileContents = await getBeatmap(songId, fromDifficultyId);
			// Save it to our destination difficulty.
			await saveBeatmap(songId, toDifficultyId, JSON.stringify(sourceDifficultyFileContents));
			// Pull that updated redux state and save it to our Info.dat
			const song = getSongById(state, songId);
			// Back up our latest data!
			await saveInfoDat(song.id, createInfoContent(song, { version: 2 }));
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
				const file = await getFile<Blob>(songFilename);
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
			const beatmapFilename = getFilenameForThing(songId, FileType.BEATMAP, { difficulty });
			await deleteFile(beatmapFilename);
		},
	});
	instance.startListening({
		actionCreator: deleteSong,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			const song = getSongById(state, songId);
			deleteAllSongFiles(song);
		},
	});

	return instance.middleware;
}
