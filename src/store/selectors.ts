import { createDraftSafeSelector, createSelector } from "@reduxjs/toolkit";
import { calculateNps } from "bsmap";
import type { wrapper } from "bsmap/types";
import { shallowEqual } from "react-redux";

import { convertBeatsToMilliseconds, convertMillisecondsToBeats, snapToNearestBeat } from "$/helpers/audio.helpers";
import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { deriveEventTracksForEnvironment, resolveEventColor, resolveEventEffect } from "$/helpers/events.helpers";
import { getEditorOffset } from "$/helpers/song.helpers";
import { App, type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";
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
import visualizer from "./features/visualizer.slice";
import { createGridObjectSelector, selectHistory } from "./helpers";
import type { RootState } from "./setup";

export const { selectInitialized, selectLoading, selectProcessingImport } = global.getSelectors((state: Pick<RootState, "global">) => {
	return state.global;
});

export const { selectActiveSongId, selectActiveBeatmapId } = selected.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.active;
});

export const {
	selectId: selectSongId,
	selectEntities: selectSongs,
	selectIds: selectSongIds,
	selectAll: selectAllSongs,
	selectById: selectSongById,
	selectSongMetadata,
	selectBeatmaps,
	selectBeatmapIds,
	selectAllBeatmaps,
	selectBeatmapById,
	selectLightshowIdForBeatmap,
	selectBeatmapIdsWithLightshowId,
	selectColorScheme,
	selectColorSchemeIds,
	selectSelectedBeatmap,
	selectDemo,
	selectModuleEnabled,
	selectCustomColors,
	selectGridSize,
	selectPlacementMode,
} = songs.getSelectors((state: Pick<RootState, "songs">) => {
	return state.songs;
});

// for selectors that depend on an actively selected song, we should have a fallback value prepared in the off chance the song doesn't exist in state or the called value returns undefined.
export function createActiveSongSelectorFactory<T>(selector: (song: App.ISong) => T) {
	return createSelector(selectSongById, selectSongs, selectActiveSongId, (song, songs, sid) => {
		if (sid) return selector(songs[sid]);
		return selector(song);
	});
}
export const selectBpm = createActiveSongSelectorFactory((s) => s.bpm);
export const selectEditorOffset = createActiveSongSelectorFactory(getEditorOffset);
export const selectEditorOffsetInBeats = createSelector(selectBpm, selectEditorOffset, (bpm, offset) => {
	return convertMillisecondsToBeats(offset, bpm);
});

export const selectBeatForTime = createSelector([selectBpm, selectEditorOffset, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, time: number) => time, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, _3: number, options = { withOffset: true }) => options], (bpm, offset, time, { withOffset }) => {
	return convertMillisecondsToBeats(time - (withOffset ? offset : 0), bpm);
});
export const selectNearestBeatForTime = createSelector([selectBpm, selectEditorOffset, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, time: number) => time], (bpm, offset, time) => {
	return snapToNearestBeat(time, bpm, offset);
});
export const selectTimeForBeat = createSelector([selectBpm, selectEditorOffset, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, beat: number) => beat, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, _3: number, options = { withOffset: true }) => options], (bpm, offset, beat, { withOffset }) => {
	return convertBeatsToMilliseconds(beat, bpm) + (withOffset ? offset : 0);
});

export const selectEventTracksForEnvironment = createSelector([selectBeatmapById], (beatmap) => {
	const environment = beatmap.environmentName;
	return deriveEventTracksForEnvironment(environment);
});

export const { selectPlaying, selectCursorPosition, selectDuration, selectSnap, selectBeatDepth, selectAnimateTrack, selectAnimateEnvironment, selectPlaybackRate, selectSongVolume, selectTickVolume, selectTickType } = navigation.getSelectors((state: RootState) => {
	return state.navigation;
});
export const selectCursorPositionInBeats = createSelector(selectCursorPosition, selectBpm, selectEditorOffset, (cursorPosition, bpm, offset) => {
	if (cursorPosition === null) return null;
	return convertMillisecondsToBeats(cursorPosition - offset, bpm);
});
export const selectDurationInBeats = createSelector(selectDuration, selectBpm, (duration, bpm) => {
	if (duration === null) return null;
	return convertMillisecondsToBeats(duration, bpm);
});

export const {
	selectNew,
	selectAnnouncements,
	selectUsername,
	selectProcessingDelay: selectAudioProcessingDelay,
	selectRenderScale,
	selectBloomEnabled,
	selectPacerWait,
} = user.getSelectors((state: Pick<RootState, "user">) => {
	return state.user;
});
export const selectAudioProcessingDelayInBeats = createSelector(selectAudioProcessingDelay, selectBpm, (processingDelay, bpm) => {
	return convertMillisecondsToBeats(processingDelay, bpm);
});
export const selectUsableAudioProcessingDelay = createSelector(selectAudioProcessingDelay, selectPlaying, (processingDelay, isPlaying) => {
	// If we're not playing the track, we shouldn't have any processing delay. This is to prevent stuff from firing prematurely when scrubbing.
	return isPlaying ? processingDelay : 0;
});
export const selectUsableAudioProcessingDelayInBeats = createSelector(selectAudioProcessingDelayInBeats, selectPlaying, (processingDelay, isPlaying) => {
	return isPlaying ? processingDelay : 0;
});
export const selectSurfaceDepth = createSelector(selectRenderScale, (renderScale) => {
	return Math.max(renderScale * 75, 25);
});

export const { selectWaveformData } = visualizer.getSelectors((state: RootState) => {
	return state.waveform;
});

export const {
	selectTool: selectNotesEditorTool,
	selectDirection: selectNotesEditorDirection,
	selectSelectionMode: selectNotesEditorSelectionMode,
	selectDefaultObstacleDuration,
	selectGridPresets,
	selectAllGridPresetIds,
	selectGridPresetById,
} = beatmap.getSelectors((state: RootState) => {
	return state.editor.notes;
});

export const {
	selectTool: selectEventsEditorTool,
	selectColor: selectEventsEditorColor,
	selectEditMode: selectEventsEditorEditMode,
	selectCursor: selectEventsEditorCursor,
	selectTrackHeight: selectEventsEditorTrackHeight,
	selectTrackOpacity: selectEventsEditorTrackOpacity,
	selectPreview: selectEventsEditorPreview,
	selectWindowLock: selectEventsEditorWindowLock,
	selectMirrorLock: selectEventsEditorMirrorLock,
	selectZoomLevel: selectEventsEditorZoomLevel,
	selectBeatsPerZoomLevel: selectEventsEditorBeatsPerZoomLevel,
} = lightshow.getSelectors((state: RootState) => {
	return state.editor.events;
});
export const selectEventEditorZoomLevelStartBeat = createSelector(selectCursorPositionInBeats, selectEventsEditorBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	return floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
});
export const selectEventEditorStartAndEndBeat = createSelector(selectCursorPositionInBeats, selectEventsEditorBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	const startBeat = floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
	return { startBeat: startBeat, numOfBeatsToShow: beatsPerZoomLevel, endBeat: startBeat + beatsPerZoomLevel };
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

export function createVisibleObjectsSelector<T extends wrapper.IWrapBaseObject>(selector: (state: RootState) => T[]) {
	return createSelector(
		[selector, (_1, _2, options: { beatDepth: number; surfaceDepth: number; includeSpaceBeforeGrid?: boolean }) => options, selectCursorPositionInBeats],
		(objects, { beatDepth, surfaceDepth, includeSpaceBeforeGrid }, cursorPositionInBeats) => {
			const numOfBeatsInRange = surfaceDepth / beatDepth;
			const cursor = cursorPositionInBeats ?? 0;
			return objects.filter((x) => {
				const numOfBeatsBeforeGrid = ("duration" in x && typeof x.duration === "number" ? x.duration : 0) + 0.01;
				const [closeLimit, farLimit] = calculateVisibleRange(cursor, numOfBeatsInRange, includeSpaceBeforeGrid ? numOfBeatsBeforeGrid + numOfBeatsInRange : numOfBeatsBeforeGrid);
				return x.time > closeLimit && x.time < farLimit;
			});
		},
		{ memoizeOptions: { resultEqualityCheck: shallowEqual } },
	);
}

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
		(state) => state?.notes ?? notes.getInitialState(),
	),
);
export const { selectAll: selectFutureColorNotes } = notes.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.future,
		(state) => state?.notes ?? notes.getInitialState(),
	),
);
export const selectVisibleNotes = createVisibleObjectsSelector<App.IColorNote>(selectAllColorNotes);

export const selectNoteDensity = createSelector(selectAllColorNotes, selectDuration, (notes, duration) => {
	return calculateNps({ difficulty: { colorNotes: notes } }, duration ? duration / 1000 : 0);
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
		(state) => state?.bombs ?? bombs.getInitialState(),
	),
);
export const { selectAll: selectFutureBombNotes } = bombs.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.future,
		(state) => state?.bombs ?? bombs.getInitialState(),
	),
);
export const selectVisibleBombs = createVisibleObjectsSelector(selectAllBombNotes);

export const selectAllNotes = createDraftSafeSelector(selectAllColorNotes, selectAllBombNotes, (notes, bombs) => [...notes, ...bombs]);
export const selectNoteByPosition = createGridObjectSelector(selectAllNotes);

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
		(state) => state?.obstacles ?? obstacles.getInitialState(),
	),
);
export const { selectAll: selectFutureObstacles } = obstacles.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.beatmap.future,
		(state) => state?.obstacles ?? obstacles.getInitialState(),
	),
);
export const selectAllVisibleObstacles = createVisibleObjectsSelector(selectAllObstacles);

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
	selectValueForTrackAtBeat,
} = basic.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.lightshow.present.basic;
});
export const { selectAll: selectPastBasicEvents } = basic.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.past,
		(state) => state?.basic ?? basic.getInitialState(),
	),
);
export const { selectAll: selectFutureBasicEvents } = basic.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.future,
		(state) => state?.basic ?? basic.getInitialState(),
	),
);
export const selectAllBasicEventsForTrackInWindow = createDraftSafeSelector([selectAllBasicEventsForTrack, selectEventEditorStartAndEndBeat], (events, { startBeat, endBeat }) => {
	return events.filter((event) => event.time >= startBeat && event.time < endBeat);
});
export const selectInitialStateForTrack = createDraftSafeSelector([selectAllBasicEventsForTrack, selectEventEditorStartAndEndBeat], (events, { startBeat }) => {
	const eventsInWindow = events.filter((event) => event.time <= startBeat);
	const lastEvent = eventsInWindow[eventsInWindow.length - 1];
	const eventEffect = lastEvent ? resolveEventEffect(lastEvent) : null;
	const isLastEventOn = eventEffect === App.BasicEventEffect.ON || eventEffect === App.BasicEventEffect.FLASH || eventEffect === App.BasicEventEffect.TRANSITION;
	return {
		color: isLastEventOn ? resolveEventColor(lastEvent) : null,
		brightness: isLastEventOn ? (lastEvent?.floatValue ?? 0) : null,
	};
});

export const selectAllSelectedEvents = createSelector(selectAllSelectedBasicEvents, (basic) => {
	return {
		basic: basic.length > 0 ? basic : undefined,
	};
});

export const selectAllSelectedEntities = createSelector([selectAllSelectedObjects, selectAllSelectedEvents, (_, view: View) => view], (objects, events, view) => {
	return {
		notes: view === View.BEATMAP ? objects.notes : undefined,
		bombs: view === View.BEATMAP ? objects.bombs : undefined,
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
