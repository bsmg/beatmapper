import { createSelector } from "@reduxjs/toolkit";

import { SURFACE_DEPTHS } from "$/constants";
import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { calculateNoteDensity } from "$/helpers/notes.helpers";
import { App, View } from "$/types";
import { floorToNearest } from "$/utils";
import { selectHistory } from "./helpers";
import type { RootState } from "./setup";

import bookmarks from "./features/bookmarks.slice";
import clipboard from "./features/clipboard.slice";
import beatmap from "./features/editor/beatmap.slice";
import lightshow from "./features/editor/lightshow.slice";
import notes from "./features/entities/beatmap/notes.slice";
import obstacles from "./features/entities/beatmap/obstacles.slice";
import difficulty from "./features/entities/difficulty.slice";
import tracks from "./features/entities/lightshow/tracks.slice";
import global from "./features/global.slice";
import navigation from "./features/navigation.slice";
import songs from "./features/songs.slice";
import user from "./features/user.slice";
import waveform from "./features/waveform.slice";

export const { getHasInitialized } = global.getSelectors((state: RootState) => {
	return state.global;
});

export const { getAllSongIds, getAllSongs, getAllSongsChronologically, getCustomColors, getDemoSong, getEnabledFastWalls, getEnabledLightshow, getEnabledMods, getGridSize, getMappingMode, getProcessingImport, getSelectedSong, getSelectedSongDifficultyIds, getSelectedSongId, getSongById } = songs.getSelectors(
	(state: RootState) => {
		return state.songs;
	},
);

export const { getAnimateBlockMotion, getAnimateRingMotion, getBeatDepth, getCursorPosition, getDuration, getIsLoading, getIsPlaying, getPlayNoteTick, getPlaybackRate, getSnapTo, getVolume } = navigation.getSelectors((state: RootState) => {
	return state.navigation;
});
export const getCursorPositionInBeats = createSelector(getSelectedSong, getCursorPosition, (song, cursorPosition) => {
	if (!song || cursorPosition === null) return null;
	return convertMillisecondsToBeats(cursorPosition - song.offset, song.bpm);
});
export const getDurationInBeats = createSelector(getSelectedSong, getDuration, (song, duration) => {
	if (!song || duration === null) return null;
	return convertMillisecondsToBeats(duration, song.bpm);
});

export const { getGraphicsLevel, getIsNewUser, getProcessingDelay, getSeenPrompts, getStickyMapAuthorName } = user.getSelectors((state: Pick<RootState, "user">) => {
	return state.user;
});
export const getUsableProcessingDelay = createSelector(getProcessingDelay, getIsPlaying, (processingDelay, isPlaying) => {
	// If we're not playing the track, we shouldn't have any processing delay. This is to prevent stuff from firing prematurely when scrubbing.
	return isPlaying ? processingDelay : 0;
});

export const { getWaveformData } = waveform.getSelectors((state: RootState) => {
	return state.waveform;
});

export const { getDefaultObstacleDuration, getGridPresets, getAllGridPresetIds, getGridPresetById, getNoteSelectionMode, getSelectedCutDirection, getSelectedNoteTool } = beatmap.getSelectors((state: RootState) => {
	return state.editor.notes;
});

export const { getAreLasersLocked, getBackgroundOpacity, getBeatsPerZoomLevel, getIsLockedToCurrentWindow, getRowHeight, getSelectedEventBeat, getSelectedEventColor, getSelectedEventEditMode, getSelectedEventTool, getSelectionBox, getShowLightingPreview, getZoomLevel } = lightshow.getSelectors((state: RootState) => {
	return state.editor.events;
});
export const getZoomLevelStartBeat = createSelector(getCursorPositionInBeats, getBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	return floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
});
export const getZoomLevelEndBeat = createSelector(getZoomLevelStartBeat, getBeatsPerZoomLevel, (startBeat, beatsPerZoomLevel) => {
	return startBeat + beatsPerZoomLevel;
});
// TODO: Get rid of this silly selector!
export const getStartAndEndBeat = createSelector(getZoomLevelStartBeat, getZoomLevelEndBeat, (startBeat, endBeat) => {
	return { startBeat, endBeat };
});

export const { getDifficulty } = difficulty.getSelectors((state: RootState) => {
	return state.editorEntities.difficulty;
});

export const getCanUndo = createSelector(
	(state: RootState) => state.editorEntities.notesView,
	(history) => {
		return history.past.length > 0;
	},
);
export const getCanRedo = createSelector(
	(state: RootState) => state.editorEntities.notesView,
	(history) => {
		return history.future.length > 0;
	},
);

export const { getNotes, getNumOfBlocks, getNumOfMines, getSelectedBlocks, getSelectedMines, getSelectedNotes } = notes.getSelectors((state: RootState) => {
	return state.editorEntities.notesView.present.notes;
});
export const { getNotes: getPastNotes } = notes.getSelectors(
	selectHistory(
		(state: RootState) => state.editorEntities.notesView.past,
		(state) => state.notes,
	),
);
export const { getNotes: getFutureNotes } = notes.getSelectors(
	selectHistory(
		(state: RootState) => state.editorEntities.notesView.future,
		(state) => state.notes,
	),
);
export const getVisibleNotes = createSelector(getNotes, getCursorPositionInBeats, getBeatDepth, getGraphicsLevel, (notes, cursorPositionInBeats, beatDepth, graphicsLevel) => {
	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel, { includeSpaceBeforeGrid: true });
	return notes.filter((note) => {
		return note._time > closeLimit && note._time < farLimit;
	});
});
export const getNoteDensity = createSelector(getVisibleNotes, getBeatDepth, getSelectedSong, getGraphicsLevel, (notes, beatDepth, song, graphicsLevel) => {
	const surfaceDepth = SURFACE_DEPTHS[graphicsLevel];
	if (!song) return 0;
	const { bpm } = song;
	const segmentLengthInBeats = (surfaceDepth / beatDepth) * 1.2;
	return calculateNoteDensity(notes.length, segmentLengthInBeats, bpm);
});

export const { getNumOfObstacles, getObstacles, getSelectedObstacles } = obstacles.getSelectors((state: RootState) => {
	return state.editorEntities.notesView.present.obstacles;
});
export const { getObstacles: getPastObstacles } = obstacles.getSelectors(
	selectHistory(
		(state: RootState) => state.editorEntities.notesView.past,
		(state) => state.obstacles,
	),
);
export const { getObstacles: getFutureObstacles } = obstacles.getSelectors(
	selectHistory(
		(state: RootState) => state.editorEntities.notesView.future,
		(state) => state.obstacles,
	),
);
export const getVisibleObstacles = createSelector(getObstacles, getCursorPositionInBeats, getBeatDepth, getGraphicsLevel, (obstacles, cursorPositionInBeats, beatDepth, graphicsLevel) => {
	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel, { includeSpaceBeforeGrid: true });
	return obstacles.filter((obstacle) => {
		const beatEnd = obstacle.beatNum + obstacle.beatDuration;
		return beatEnd > closeLimit && obstacle.beatNum < farLimit;
	});
});

export const selectAllSelectedObjects = createSelector(getSelectedNotes, getSelectedObstacles, (notes, obstacles) => {
	return {
		notes: notes.length > 0 ? notes : undefined,
		obstacles: obstacles.length > 0 ? obstacles : undefined,
	};
});

export const {
	getAllEventsAsArray,
	getEventForTrackAtBeat,
	getEvents,
	getSelectedEvents: getSelectedBasicEvents,
	getTrackSpeedAtBeat,
	getTracks,
} = tracks.getSelectors((state: RootState) => {
	return state.editorEntities.eventsView.present.tracks;
});
export const { getEvents: getPastEvents } = tracks.getSelectors(
	selectHistory(
		(state: RootState) => state.editorEntities.eventsView.past,
		(state) => state.tracks,
	),
);
export const { getEvents: getFutureEvents } = tracks.getSelectors(
	selectHistory(
		(state: RootState) => state.editorEntities.eventsView.future,
		(state) => state.tracks,
	),
);
export function makeGetEventsForTrack(trackId: App.TrackId) {
	return createSelector(getStartAndEndBeat, getTracks, ({ startBeat, endBeat }, tracks) => {
		return tracks[trackId].filter((event) => event.beatNum >= startBeat && event.beatNum < endBeat);
	});
}
export function makeGetInitialTrackLightingColorType(trackId: App.TrackId) {
	return createSelector(getStartAndEndBeat, getTracks, ({ startBeat }, tracks) => {
		const eventsInWindow = tracks[trackId].filter((event) => event.beatNum < startBeat);
		const lastEvent = eventsInWindow[eventsInWindow.length - 1];
		if (!lastEvent) return null;
		const isLastEventOn = lastEvent.type === App.BasicEventType.ON || lastEvent.type === App.BasicEventType.FLASH;
		return isLastEventOn ? lastEvent.colorType : null;
	});
}

export const selectAllSelectedEvents = createSelector(getSelectedBasicEvents, (basic) => {
	return {
		basic: basic.length > 0 ? basic : undefined,
	};
});

export const selectAllSelectedEntities = createSelector([selectAllSelectedObjects, selectAllSelectedEvents, (_, view: View) => view], (objects, events, view) => {
	return {
		notes: view === View.BEATMAP ? objects.notes : undefined,
		obstacles: view === View.BEATMAP ? objects.obstacles : undefined,
		events: view === View.LIGHTSHOW ? events.basic : undefined,
	};
});

export const { getBookmarks, getSortedBookmarksArray } = bookmarks.getSelectors((state: RootState) => {
	return state.bookmarks;
});

export const { selectData: selectClipboardData, selectHasObjects: selectClipboardHasObjects } = clipboard.getSelectors((state: Pick<RootState, "clipboard">) => {
	return state.clipboard;
});
