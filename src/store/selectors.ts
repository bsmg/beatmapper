import { createDraftSafeSelector, createSelector } from "@reduxjs/toolkit";
import { calculateNps, type IWrapBaseObject, sortObjectFn } from "bsmap";
import { shallowEqual } from "react-redux";

import { DEFAULT_GRID } from "$/constants";
import { convertBeatsToMilliseconds, convertMillisecondsToBeats, snapToNearestBeat } from "$/helpers/audio.helpers";
import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { isLightEffectActive, resolveBasicEventColor, resolveBasicEventEffect } from "$/helpers/events.helpers";
import { getGridSize } from "$/helpers/song.helpers";
import { type App, type BeatmapId, type ILightState, NotePlacementMode, ObjectTool, ObstaclePlacementMode, type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";
import clipboard from "./features/clipboard.slice";
import beatmap from "./features/editor/beatmap.slice";
import lightshow from "./features/editor/lightshow.slice";
import bombs from "./features/entities/beatmap/bombs.slice";
import notes from "./features/entities/beatmap/notes.slice";
import obstacles from "./features/entities/beatmap/obstacles.slice";
import bookmarks from "./features/entities/editor/bookmarks.slice";
import basicEvents from "./features/entities/lightshow/basic.slice";
import boostEvents from "./features/entities/lightshow/boost.slice";
import global from "./features/global.slice";
import navigation from "./features/navigation.slice";
import songs from "./features/songs.slice";
import user from "./features/user.slice";
import visualizer from "./features/visualizer.slice";
import { selectHistory } from "./helpers";
import type { RootState } from "./setup";

export const { selectInitialized, selectLoading, selectProcessingImport } = global.getSelectors((state: Pick<RootState, "global">) => {
	return state.global;
});

export const {
	selectId: selectSongId,
	selectEntities: selectSongs,
	selectIds: selectSongIds,
	selectAll: selectAllSongs,
	selectById: selectSongById,
	selectSongMetadata,
	selectBpm,
	selectEditorOffset,
	selectEditorOffsetInBeats,
	selectBeatmaps,
	selectBeatmapIds,
	selectAllBeatmaps,
	selectBeatmapById,
	selectJumpSpeed,
	selectJumpOffset,
	selectLightshowIds,
	selectLightshowIdForBeatmap,
	selectBeatmapIdsWithLightshowId,
	selectEnvironment,
	selectColorScheme,
	selectEventTracksForEnvironment,
	selectColorSchemes,
	selectColorSchemeIds,
	selectColorSchemeId,
	selectColorSchemeOverrides,
	selectSelectedBeatmap,
	selectDemo,
	selectModuleEnabled,
	selectCustomColors,
} = songs.getSelectors((state: Pick<RootState, "songs">) => {
	return state.songs;
});

export const selectBeatForTime = createDraftSafeSelector([selectBpm, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, time: number) => time], (bpm, time) => {
	return convertMillisecondsToBeats(time, bpm);
});
export const selectTimeForBeat = createDraftSafeSelector([selectBpm, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, beat: number) => beat], (bpm, beat) => {
	return convertBeatsToMilliseconds(beat, bpm);
});

export const { selectPlaying, selectCursorPosition, selectDuration, selectSnap, selectBeatDepth, selectAnimateTrack, selectAnimateEnvironment, selectPlaybackRate, selectSongVolume, selectTickVolume, selectTickType } = navigation.getSelectors((state: RootState) => {
	return state.navigation;
});
export const selectCursorPositionInBeats = createSelector(selectCursorPosition, selectBpm, selectEditorOffset, (cursorPosition, bpm, offset) => {
	return convertMillisecondsToBeats(cursorPosition - offset, bpm);
});
export const selectDurationInBeats = createSelector(selectDuration, selectBpm, (duration, bpm) => {
	if (duration === null) return null;
	return convertMillisecondsToBeats(duration, bpm);
});

export const selectNearestBeat = createDraftSafeSelector([selectSnap, selectBpm, selectEditorOffset, (_1: Pick<RootState, "songs" | "entities">, _2: SongId, time: number) => time], (snapTo, bpm, offset, time) => {
	return snapToNearestBeat(time, snapTo, bpm, offset);
});

export const {
	selectNew,
	selectAnnouncements,
	selectUsername,
	selectProcessingDelay: selectAudioProcessingDelay,
	selectRenderScale,
	selectBloomEnabled,
	selectObstaclePlacementMode: selectUserObstaclePlacementMode,
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

export const selectNotePlacementMode = createSelector(selectSongById, (song) => {
	if (song.modSettings.mappingExtensions?.isEnabled) return NotePlacementMode.EXTENSIONS;
	return NotePlacementMode.NORMAL;
});
export const selectObstaclePlacementMode = createSelector(selectSongById, selectUserObstaclePlacementMode, (song, userPlacementMode) => {
	if (song.modSettings.mappingExtensions?.isEnabled) return ObstaclePlacementMode.EXTENSIONS;
	return userPlacementMode;
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

export const selectGridSize = createSelector(selectSongById, selectNotesEditorTool, selectObstaclePlacementMode, (song, tool, obstaclePlacementMode) => {
	switch (tool) {
		case ObjectTool.OBSTACLE: {
			const visualGridSize = { ...DEFAULT_GRID, numCols: 8, numRows: 5, rowOffset: -0.5 };
			if (obstaclePlacementMode === ObstaclePlacementMode.VISUAL) return getGridSize(song, visualGridSize);
			return getGridSize(song);
		}
		default: {
			return getGridSize(song);
		}
	}
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

export function createVisibleObjectsSelector<T extends IWrapBaseObject>(selector: (state: RootState) => T[]) {
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
export const selectVisibleNotes = createVisibleObjectsSelector(selectAllColorNotes);

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

export const selectSelectedObjects = createSelector(selectAllSelectedColorNotes, selectAllSelectedBombNotes, selectAllSelectedObstacles, (notes, bombs, obstacles) => {
	return {
		notes: notes.length > 0 ? notes : undefined,
		bombs: bombs.length > 0 ? bombs : undefined,
		obstacles: obstacles.length > 0 ? obstacles : undefined,
	};
});
export const selectAllSelectedObjects = createSelector(selectAllSelectedColorNotes, selectAllSelectedBombNotes, selectAllSelectedObstacles, (notes, bombs, obstacles) => {
	return [...notes, ...bombs, ...obstacles].sort(sortObjectFn);
});
export const selectAnySelectedObjects = createSelector(selectAllSelectedObjects, (objects) => {
	return objects.length > 0;
});

export const {
	selectAll: selectAllBasicEvents,
	selectAllSelected: selectAllSelectedBasicEvents,
	selectAllForTrack: selectAllBasicEventsForTrack,
	selectValueForTrackAtBeat,
} = basicEvents.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.lightshow.present.basicEvents;
});
export const { selectAll: selectPastBasicEvents } = basicEvents.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.past,
		(state) => state?.basicEvents ?? basicEvents.getInitialState(),
	),
);
export const { selectAll: selectFutureBasicEvents } = basicEvents.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.future,
		(state) => state?.basicEvents ?? basicEvents.getInitialState(),
	),
);

export const {
	selectAll: selectAllBoostEvents,
	selectAllSelected: selectAllSelectedBoostEvents,
	selectToggleAtBeat,
} = boostEvents.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.lightshow.present.boostEvents;
});
export const { selectAll: selectPastBoostEvents } = boostEvents.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.past,
		(state) => state?.boostEvents ?? boostEvents.getInitialState(),
	),
);
export const { selectAll: selectFutureBoostEvents } = boostEvents.getSelectors(
	selectHistory(
		(state: Pick<RootState, "entities">) => state.entities.lightshow.future,
		(state) => state?.boostEvents ?? boostEvents.getInitialState(),
	),
);

export const selectCurrentLightStateForTrack = createDraftSafeSelector([selectEventEditorStartAndEndBeat, selectEventTracksForEnvironment, (state: RootState, _songId: SongId, _beatmapId: BeatmapId, trackId: number) => selectAllBasicEventsForTrack(state, trackId)], ({ startBeat }, tracks, events): ILightState => {
	const basicEventsInWindow = events.filter((event) => event.time <= startBeat);
	const lastBasicEvent = basicEventsInWindow[basicEventsInWindow.length - 1];

	const effect = lastBasicEvent ? resolveBasicEventEffect(lastBasicEvent, tracks) : null;
	const isActive = effect && isLightEffectActive(effect);

	return {
		color: isActive ? resolveBasicEventColor(lastBasicEvent) : null,
		brightness: isActive ? (lastBasicEvent?.floatValue ?? 0) : null,
	};
});

export const selectSelectedEvents = createSelector(selectAllSelectedBasicEvents, selectAllSelectedBoostEvents, (basicEvents, boostEvents) => {
	return {
		basicEvents: basicEvents.length > 0 ? basicEvents : undefined,
		boostEvents: boostEvents.length > 0 ? boostEvents : undefined,
	};
});
export const selectAllSelectedEvents = createSelector(selectAllSelectedBasicEvents, selectAllSelectedBoostEvents, (basicEvents, boostEvents) => {
	return [...basicEvents, ...boostEvents].sort(sortObjectFn);
});
export const selectAnySelectedEvents = createSelector(selectAllSelectedEvents, (events) => {
	return events.length > 0;
});

export const selectSelectedBeatmapEntities = createSelector([selectSelectedObjects, selectSelectedEvents, (_, view: View) => view], (objects, events, view): Partial<Omit<App.IBeatmapEntities, "bookmarks">> => {
	return {
		notes: view === View.BEATMAP ? objects.notes : undefined,
		bombs: view === View.BEATMAP ? objects.bombs : undefined,
		obstacles: view === View.BEATMAP ? objects.obstacles : undefined,
		basicEvents: view === View.LIGHTSHOW ? events.basicEvents : undefined,
		boostEvents: view === View.LIGHTSHOW ? events.boostEvents : undefined,
	};
});
export const selectAllSelectedBeatmapEntities = createSelector([selectAllSelectedObjects, selectAllSelectedEvents], (objects, events) => {
	return [...objects, ...events].sort(sortObjectFn);
});

export const { selectAll: selectAllBookmarks } = bookmarks.getSelectors((state: Pick<RootState, "entities">) => {
	return state.entities.editor.bookmarks;
});

export const selectBeatmapEntities = createSelector([selectAllColorNotes, selectAllBombNotes, selectAllObstacles, selectAllBasicEvents, selectAllBoostEvents, selectAllBookmarks], (notes, bombs, obstacles, basicEvents, boostEvents, bookmarks): App.IBeatmapEntities => {
	return { notes, bombs, obstacles, basicEvents, boostEvents, bookmarks };
});

export const {
	selectData: selectClipboardData,
	selectHasObjects: selectClipboardHasObjects,
	selectHasEvents: selectClipboardHasEvents,
	selectEarliestBeat,
} = clipboard.getSelectors((state: Pick<RootState, "clipboard">) => {
	return state.clipboard;
});
