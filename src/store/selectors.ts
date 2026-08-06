import { createDraftSafeSelector, createSelector } from "@reduxjs/toolkit";
import { calculateNps, type IWrapBaseObject, TimeProcessor } from "bsmap";
import { shallowEqual } from "react-redux";

import { DEFAULT_GRID } from "$/constants";
import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { isLightEffectActive, resolveBasicEventColor, resolveBasicEventEffect } from "$/helpers/events.helpers";
import { getGridSize } from "$/helpers/song.helpers";
import { getAudioContext } from "$/setup";
import { type App, type BeatmapId, type ILightState, NotePlacementMode, ObjectTool, ObstaclePlacementMode, type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";
import beatmap from "./features/beatmap.slice";
import bookmarks from "./features/bookmarks.slice";
import clipboard from "./features/clipboard.slice";
import events from "./features/events.slice";
import global from "./features/global.slice";
import lightshow from "./features/lightshow.slice";
import navigation from "./features/navigation.slice";
import objects from "./features/objects.slice";
import songs from "./features/songs.slice";
import timeline from "./features/timeline.slice";
import user from "./features/user.slice";
import visualizer from "./features/visualizer.slice";
import type { RootState } from "./setup";

export const { selectInitialized, selectLoading, selectProcessingImport } = global.getSelectors(global.selectSlice);

export const {
	selectId: selectSongId,
	selectEntities: selectSongs,
	selectIds: selectSongIds,
	selectAll: selectAllSongs,
	selectById: selectSongById,
	selectSongMetadata,
	selectBpm,
	selectEditorOffset,
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
} = songs.getSelectors(songs.selectSlice);

export const { selectTimescale } = timeline.getSelectors(timeline.selectSlice);

export const selectTimeProcessor = createDraftSafeSelector([selectBpm, selectTimescale], (bpm, timeline) => {
	return new TimeProcessor(bpm, timeline, 0);
});

export const selectBeatForTime = createDraftSafeSelector([selectTimeProcessor, selectEditorOffset, (_1: RootState, _2: SongId, time: number) => time], (timeProcessor, offset, time) => {
	return timeProcessor.toBeatTime(time - offset);
});
export const selectTimeForBeat = createDraftSafeSelector([selectTimeProcessor, selectEditorOffset, (_1: RootState, _2: SongId, beat: number) => beat], (timeProcessor, offset, beat) => {
	return timeProcessor.toRealTime(beat) + offset;
});

export const { selectPlaying, selectCursorPosition, selectDuration, selectSnap, selectBeatDepth, selectAnimateTrack, selectAnimateEnvironment, selectPlaybackRate, selectSongVolume, selectTickVolume, selectTickType } = navigation.getSelectors(navigation.selectSlice);

export const selectCursorPositionInBeats = createSelector([selectTimeProcessor, selectCursorPosition, selectEditorOffset], (timeProcessor, cursorPosition, offset) => {
	return timeProcessor.toBeatTime(cursorPosition - offset);
});
export const selectDurationInBeats = createSelector([selectTimeProcessor, selectDuration], (timeProcessor, duration) => {
	if (duration === null) return null;
	return timeProcessor.toBeatTime(duration);
});
export const selectEditorOffsetInBeats = createSelector([selectTimeProcessor, selectEditorOffset], (timeProcessor, offset) => {
	return timeProcessor.toBeatTime(offset);
});

export const selectBpmScale = createSelector([selectTimeProcessor, selectBpm, selectCursorPositionInBeats], (timeProcessor, baseBpm, currentBeat) => {
	const timescales = timeProcessor.timescale;

	let activeBpm = baseBpm;

	for (let i = timescales.length - 1; i >= 0; i--) {
		if (timescales[i].time <= currentBeat) {
			activeBpm = timescales[i].bpm;
			break;
		}
	}

	return activeBpm / baseBpm;
});

export const { selectNew, selectAnnouncements, selectUsername, selectRenderScale, selectBloomEnabled, selectObstaclePlacementMode: selectUserObstaclePlacementMode, selectPacerWait } = user.getSelectors(user.selectSlice);

export const selectAudioLatencyInBeats = createSelector([selectTimeProcessor], (timeProcessor) => {
	const { baseLatency } = getAudioContext();
	return timeProcessor.toBeatTime(baseLatency);
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

export const { selectWaveformData } = visualizer.getSelectors(visualizer.selectSlice);

export const { selectTool: selectNotesEditorTool, selectDirection: selectNotesEditorDirection, selectSelectionMode: selectNotesEditorSelectionMode, selectDefaultObstacleDuration, selectGridPresets, selectAllGridPresetIds, selectGridPresetById } = beatmap.getSelectors(beatmap.selectSlice);

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
} = lightshow.getSelectors(lightshow.selectSlice);

export const selectEventEditorZoomLevelStartBeat = createSelector(selectCursorPositionInBeats, selectEventsEditorBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	return floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
});
export const selectEventEditorStartAndEndBeat = createSelector(selectCursorPositionInBeats, selectEventsEditorBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	const startBeat = floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
	return { startBeat: startBeat, numOfBeatsToShow: beatsPerZoomLevel, endBeat: startBeat + beatsPerZoomLevel };
});

export const {
	selectCanUndo: selectObjectsCanUndo,
	selectCanRedo: selectObjectsCanRedo,
	selectAllColorNotes,
	selectAllSelectedColorNotes,
	selectTotalColorNotes,
	selectPastColorNotes,
	selectFutureColorNotes,
	selectAllBombNotes,
	selectAllSelectedBombNotes,
	selectTotalBombNotes: selectedTotalBombNotes,
	selectPastBombNotes,
	selectFutureBombNotes,
	selectAllNotes,
	selectAllObstacles,
	selectAllSelectedObstacles,
	selectTotalObstacles,
	selectPastObstacles,
	selectFutureObstacles,
	selectSelectedObjects,
	selectAnySelectedObjects,
} = objects.getSelectors(objects.selectSlice);

export const selectNoteDensity = createSelector(selectAllColorNotes, selectDuration, (notes, duration) => {
	return calculateNps({ difficulty: { colorNotes: notes } }, duration ?? 0);
});

function createVisibleObjectsSelector<T extends IWrapBaseObject>(selector: (state: RootState) => T[]) {
	return createSelector(
		[selector, (_1, _2, options: { timescale: (time: number) => number; beatDepth: number; surfaceDepth: number; includeSpaceBeforeGrid?: boolean }) => options, selectCursorPositionInBeats],
		(objects, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid }, cursorPositionInBeats) => {
			const numOfBeatsInRange = surfaceDepth / beatDepth;
			const cursor = timescale(cursorPositionInBeats ?? 0);
			return objects.filter((x) => {
				const time = timescale(x.time);
				const numOfBeatsBeforeGrid = timescale(("duration" in x && typeof x.duration === "number" ? x.duration : 0) + 0.01);
				const [closeLimit, farLimit] = calculateVisibleRange(cursor, numOfBeatsInRange, includeSpaceBeforeGrid ? numOfBeatsBeforeGrid + numOfBeatsInRange : numOfBeatsBeforeGrid);
				return time > closeLimit && time < farLimit;
			});
		},
		{ memoizeOptions: { resultEqualityCheck: shallowEqual } },
	);
}

export const selectVisibleNotes = createVisibleObjectsSelector(selectAllColorNotes);
export const selectVisibleBombs = createVisibleObjectsSelector(selectAllBombNotes);
export const selectAllVisibleObstacles = createVisibleObjectsSelector(selectAllObstacles);

export const {
	selectAllBasicEvents,
	selectAllSelectedBasicEvents,
	selectAllBasicEventsForTrack,
	selectValueForTrackAtBeat,
	selectPastBasicEvents,
	selectFutureBasicEvents,
	selectAllBoostEvents,
	selectAllSelectedBoostEvents,
	selectColorBoostAtBeat,
	selectPastBoostEvents,
	selectFutureBoostEvents,
	selectSelectedEvents,
	selectAnySelectedEvents,
} = events.getSelectors(events.selectSlice);

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

export const selectSelectedBeatmapEntities = createSelector([selectSelectedObjects, selectSelectedEvents, (_, view: View) => view], (objects, events, view): Partial<Omit<App.IBeatmapEntities, "bookmarks">> => {
	return {
		notes: view === View.BEATMAP ? objects.notes : undefined,
		bombs: view === View.BEATMAP ? objects.bombs : undefined,
		obstacles: view === View.BEATMAP ? objects.obstacles : undefined,
		basicEvents: view === View.LIGHTSHOW ? events.basicEvents : undefined,
		boostEvents: view === View.LIGHTSHOW ? events.boostEvents : undefined,
	};
});

export const { selectAll: selectAllBookmarks } = bookmarks.getSelectors(bookmarks.selectSlice);

export const selectBeatmapEntities = createSelector([selectAllColorNotes, selectAllBombNotes, selectAllObstacles, selectAllBasicEvents, selectAllBoostEvents, selectAllBookmarks], (notes, bombs, obstacles, basicEvents, boostEvents, bookmarks): App.IBeatmapEntities => {
	return { notes, bombs, obstacles, basicEvents, boostEvents, bookmarks };
});

export const { selectData: selectClipboardData, selectHasObjects: selectClipboardHasObjects, selectHasEvents: selectClipboardHasEvents, selectEarliestBeat } = clipboard.getSelectors(clipboard.selectSlice);
