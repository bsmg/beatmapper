import { createDraftSafeSelector, createSelector } from "@reduxjs/toolkit";

import { SURFACE_DEPTHS } from "$/constants";
import { convertBeatsToMilliseconds, convertMillisecondsToBeats, snapToNearestBeat } from "$/helpers/audio.helpers";
import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { calculateNoteDensity } from "$/helpers/notes.helpers";
import { App, type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";
import { createByPositionSelector, selectHistory } from "./helpers";
import type { RootState } from "./setup";

import clipboard from "./features/clipboard.slice";
import beatmap from "./features/editor/beatmap.slice";
import lightshow from "./features/editor/lightshow.slice";
import selected from "./features/entities/active.slice";
import bombs from "./features/entities/beatmap/bombs.slice";
import notes from "./features/entities/beatmap/notes.slice";
import obstacles from "./features/entities/beatmap/obstacles.slice";
import bookmarks from "./features/entities/editor/bookmarks.slice";
import basic from "./features/entities/lightshow/basic.slice";
import global from "./features/global.slice";
import navigation from "./features/navigation.slice";
import songs from "./features/songs.slice";
import user from "./features/user.slice";
import waveform from "./features/waveform.slice";

export const { selectInitialized, selectIsLoading, selectIsProcessingImport } = global.getSelectors((state: Pick<RootState, "global">) => {
	return state.global;
});

export const { selectActiveSongId, selectActiveBeatmapId } = selected.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.active;
});

export const {
	selectEntities: selectSongs,
	selectIds: selectSongIds,
	selectAll: selectAllSongs,
	selectById: selectSongById,
	selectByIdOrNull: selectSongByIdOrNull,
	selectBeatmapIds,
	selectAllBeatmaps,
	selectBeatmapById,
	selectIsDemo: selectIsDemoSong,
	selectIsModuleEnabled,
	selectIsFastWallsEnabled,
	selectIsLightshowEnabled,
	selectCustomColors,
	selectGridSize,
	selectPlacementMode,
} = songs.getSelectors((state: Pick<RootState, "songs">) => {
	return state.songs;
});

// for selectors that depend on an actively selected song, we should have a fallback value prepared in the off chance the song doesn't exist in state or the called value returns undefined.
export function createActiveSongSelectorFactory<T>(selector: (song?: App.Song) => T | undefined, fallback: T) {
	return createSelector(selectSongByIdOrNull, selectSongs, selectActiveSongId, (song, songs, sid) => {
		if (song) return selector(song) ?? fallback;
		if (sid) return selector(songs[sid]) ?? fallback;
		return fallback;
	});
}
export const selectBpm = createActiveSongSelectorFactory((s) => s?.bpm, 120);
export const selectOffset = createActiveSongSelectorFactory((s) => s?.offset, 0);
export const selectOffsetInBeats = createSelector(selectBpm, selectOffset, (bpm, offset) => {
	return convertMillisecondsToBeats(offset, bpm);
});

export const selectBeatForTime = createSelector([selectBpm, selectOffset, (state: Pick<RootState, "songs" | "entities">, songId: SongId | null, time: number, withOffset = true) => ({ time, withOffset })], (bpm, offset, { time, withOffset }) => {
	return convertMillisecondsToBeats(time - (withOffset ? offset : 0), bpm);
});
export const selectNearestBeatForTime = createSelector([selectBpm, selectOffset, (state: Pick<RootState, "songs" | "entities">, songId: SongId | null, time: number) => time], (bpm, offset, time: number) => {
	return snapToNearestBeat(time, bpm, offset);
});
export const selectTimeForBeat = createSelector([selectBpm, selectOffset, (state: Pick<RootState, "songs" | "entities">, songId: SongId | null, beat: number, withOffset = true) => ({ beat, withOffset })], (bpm, offset, { beat, withOffset }) => {
	return convertBeatsToMilliseconds(beat, bpm) + (withOffset ? offset : 0);
});

export const { selectAnimateBlockMotion, selectAnimateRingMotion, selectBeatDepth, selectCursorPosition, selectDuration, selectIsPlaying, selectPlayNoteTick, selectPlaybackRate, selectSnapTo, selectVolume } = navigation.getSelectors((state: RootState) => {
	return state.navigation;
});
export const selectCursorPositionInBeats = createSelector(selectCursorPosition, selectBpm, selectOffset, (cursorPosition, bpm, offset) => {
	if (cursorPosition === null) return null;
	return convertMillisecondsToBeats(cursorPosition - offset, bpm);
});
export const selectDurationInBeats = createSelector(selectDuration, selectBpm, (duration, bpm) => {
	if (duration === null) return null;
	return convertMillisecondsToBeats(duration, bpm);
});

export const {
	selectGraphicsLevel: selectGraphicsQuality,
	selectIsNewUser: selectIsNew,
	selectProcessingDelay: selectAudioProcessingDelay,
	selectSeenPrompts,
	selectStickyMapAuthorName: selectUserName,
} = user.getSelectors((state: Pick<RootState, "user">) => {
	return state.user;
});
export const selectUsableAudioProcessingDelay = createSelector(selectAudioProcessingDelay, selectIsPlaying, (processingDelay, isPlaying) => {
	// If we're not playing the track, we shouldn't have any processing delay. This is to prevent stuff from firing prematurely when scrubbing.
	return isPlaying ? processingDelay : 0;
});
export const selectAudioProcessingDelayInBeats = createSelector(selectAudioProcessingDelay, selectBpm, (processingDelay, bpm) => {
	return convertMillisecondsToBeats(processingDelay, bpm);
});
export const selectUsableAudioProcessingDelayInBeats = createSelector(selectAudioProcessingDelayInBeats, selectIsPlaying, (processingDelay, isPlaying) => {
	return isPlaying ? processingDelay : 0;
});

export const { selectWaveformData } = waveform.getSelectors((state: RootState) => {
	return state.waveform;
});

export const {
	selectDefaultObstacleDuration,
	selectGridPresets,
	selectAllGridPresetIds,
	selectGridPresetById,
	selectNoteSelectionMode: selectNoteEditorSelectionMode,
	selectSelectedCutDirection: selectNoteEditorDirection,
	selectSelectedNoteTool: selectNoteEditorTool,
} = beatmap.getSelectors((state: RootState) => {
	return state.editor.notes;
});

export const {
	selectAreLasersLocked: selectEventEditorToggleMirror,
	selectBackgroundOpacity: selectEventBackgroundOpacity,
	selectBeatsPerZoomLevel: selectEventEditorBeatsPerZoomLevel,
	selectIsLockedToCurrentWindow: selectEventEditorToggleLoop,
	selectRowHeight: selectEventEditorRowHeight,
	selectSelectedEventBeat: selectEventEditorSelectedBeat,
	selectSelectedEventColor: selectEventEditorColor,
	selectSelectedEventEditMode: selectEventEditorEditMode,
	selectSelectedEventTool: selectEventEditorTool,
	selectSelectionBox: selectEventEditorSelectionBox,
	selectShowLightingPreview: selectEventEditorTogglePreview,
	selectZoomLevel: selectEventEditorZoomLevel,
} = lightshow.getSelectors((state: RootState) => {
	return state.editor.events;
});
export const selectEventEditorZoomLevelStartBeat = createSelector(selectCursorPositionInBeats, selectEventEditorBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	return floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
});
export const selectEventEditorZoomLevelEndBeat = createSelector(selectEventEditorZoomLevelStartBeat, selectEventEditorBeatsPerZoomLevel, (startBeat, beatsPerZoomLevel) => {
	return startBeat + beatsPerZoomLevel;
});
// TODO: Get rid of this silly selector!
export const selectEventEditorStartAndEndBeat = createSelector(selectEventEditorZoomLevelStartBeat, selectEventEditorZoomLevelEndBeat, (startBeat, endBeat) => {
	return { startBeat, endBeat };
});

export const selectObjectsCanUndo = createSelector(
	(state: RootState) => state.entities.beatmap,
	(history) => {
		return history.past.length > 0;
	},
);
export const selectObjectsCanRedo = createSelector(
	(state: RootState) => state.entities.beatmap,
	(history) => {
		return history.future.length > 0;
	},
);

export const {
	selectAll: selectAllColorNotes,
	selectAllSelected: selectAllSelectedColorNotes,
	selectTotal: selectTotalColorNotes,
} = notes.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.beatmap.present.notes;
});
export const { selectAll: selectPastColorNotes } = notes.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.past,
		(state) => state.notes,
	),
);
export const { selectAll: selectFutureColorNotes } = notes.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.future,
		(state) => state.notes,
	),
);
export const selectVisibleNotes = createSelector(selectAllColorNotes, selectCursorPositionInBeats, selectBeatDepth, selectGraphicsQuality, (notes, cursorPositionInBeats, beatDepth, graphicsLevel) => {
	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel, { includeSpaceBeforeGrid: true });
	return notes.filter((note) => {
		return note.beatNum > closeLimit && note.beatNum < farLimit;
	});
});
export const selectNoteDensity = createSelector(selectVisibleNotes, selectBeatDepth, selectBpm, selectGraphicsQuality, (notes, beatDepth, bpm, graphicsLevel) => {
	const surfaceDepth = SURFACE_DEPTHS[graphicsLevel];
	const segmentLengthInBeats = (surfaceDepth / beatDepth) * 1.2;
	return calculateNoteDensity(notes.length, segmentLengthInBeats, bpm);
});

export const {
	selectAll: selectAllBombNotes,
	selectAllSelected: selectAllSelectedBombNotes,
	selectTotal: selectedTotalBombNotes,
} = bombs.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.beatmap.present.bombs;
});
export const { selectAll: selectPastBombNotes } = bombs.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.past,
		(state) => state.bombs,
	),
);
export const { selectAll: selectFutureBombNotes } = bombs.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.future,
		(state) => state.bombs,
	),
);
export const selectVisibleBombs = createSelector(selectAllBombNotes, selectCursorPositionInBeats, selectBeatDepth, selectGraphicsQuality, (bombs, cursorPositionInBeats, beatDepth, graphicsLevel) => {
	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel, { includeSpaceBeforeGrid: true });
	return bombs.filter((note) => {
		return note.beatNum > closeLimit && note.beatNum < farLimit;
	});
});

export const selectAllNotes = createDraftSafeSelector(selectAllColorNotes, selectAllBombNotes, (notes, bombs) => [...notes, ...bombs]);
export const selectNoteByPosition = createByPositionSelector(selectAllNotes);

export const {
	selectAll: selectAllObstacles,
	selectAllSelected: selectAllSelectedObstacles,
	selectTotal: selectTotalObstacles,
} = obstacles.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.beatmap.present.obstacles;
});
export const { selectAll: selectPastObstacles } = obstacles.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.past,
		(state) => state.obstacles,
	),
);
export const { selectAll: selectFutureObstacles } = obstacles.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.future,
		(state) => state.obstacles,
	),
);
export const selectAllVisibleObstacles = createSelector(selectAllObstacles, selectCursorPositionInBeats, selectBeatDepth, selectGraphicsQuality, (obstacles, cursorPositionInBeats, beatDepth, graphicsLevel) => {
	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel, { includeSpaceBeforeGrid: true });
	return obstacles.filter((obstacle) => {
		const beatEnd = obstacle.beatNum + obstacle.beatDuration;
		return beatEnd > closeLimit && obstacle.beatNum < farLimit;
	});
});

export const selectAllSelectedObjects = createSelector(selectAllSelectedColorNotes, selectAllSelectedBombNotes, selectAllSelectedObstacles, (notes, bombs, obstacles) => {
	return {
		notes: notes.length > 0 ? notes : undefined,
		bombs: bombs.length > 0 ? bombs : undefined,
		obstacles: obstacles.length > 0 ? obstacles : undefined,
	};
});

export const {
	selectAll: selectAllBasicEvents,
	selectAllSelected: selectAllSelectedBasicEvents,
	selectAllForTrack: selectAllBasicEventsForTrack,
	selectForTrackAtBeat: selectBasicEventForTrackAtBeat,
	selectTrackSpeedAtBeat: selectValueForTrackAtBeat,
} = basic.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.lightshow.present.basic;
});
export const { selectAll: selectPastBasicEvents } = basic.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.past,
		(state) => state.basic,
	),
);
export const { selectAll: selectFutureBasicEvents } = basic.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.future,
		(state) => state.basic,
	),
);
export const selectAllBasicEventsForTrackInWindow = createDraftSafeSelector([selectAllBasicEventsForTrack, selectEventEditorStartAndEndBeat], (events, { startBeat, endBeat }) => {
	return events.filter((event) => event.beatNum >= startBeat && event.beatNum < endBeat);
});
export const selectInitialColorForTrack = createDraftSafeSelector([selectAllBasicEventsForTrack, selectEventEditorStartAndEndBeat], (events, { startBeat }) => {
	const eventsInWindow = events.filter((event) => event.beatNum < startBeat);
	const lastEvent = eventsInWindow[eventsInWindow.length - 1];
	if (!lastEvent) return null;
	const isLastEventOn = lastEvent.type === App.BasicEventType.ON || lastEvent.type === App.BasicEventType.FLASH;
	return isLastEventOn ? lastEvent.colorType : null;
});

export const selectAllSelectedEvents = createSelector(selectAllSelectedBasicEvents, (basic) => {
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

export const { selectAll: selectAllBookmarks } = bookmarks.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.editor.bookmarks;
});

export const selectAllEntities = createSelector([selectAllColorNotes, selectAllBombNotes, selectAllObstacles, selectAllBasicEvents, selectAllBookmarks], (notes, bombs, obstacles, events, bookmarks) => {
	return { notes, bombs, obstacles, events, bookmarks };
});

export const { selectData: selectClipboardData, selectHasObjects: selectClipboardHasObjects } = clipboard.getSelectors((state: Pick<RootState, "clipboard">) => {
	return state.clipboard;
});
