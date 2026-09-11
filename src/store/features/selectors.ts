import { createDraftSafeSelector, createSelector } from "@reduxjs/toolkit";
import { calculateNps, type IWrapBaseObject, TimeProcessor } from "bsmap";
import { shallowEqual } from "react-redux";

import { DEFAULT_GRID } from "$/constants/editor.constants";
import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { isLightEffectActive, resolveBasicEventColor, resolveBasicEventEffect } from "$/helpers/events.helpers";
import { getGridSize } from "$/helpers/song.helpers";
import { createAppDraftSafeSelector, createAppSelector } from "$/store/helpers/selectors";
import type { RootState } from "$/store/types";
import { type App, type BeatmapId, type ILightState, NotePlacementMode, ObjectTool, ObstaclePlacementMode, type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";
import { selectNotesEditorTool } from "./beatmap.slice";
import { selectAllBookmarks } from "./bookmarks.slice";
import { selectAllBasicEvents, selectAllBasicEventsForTrack, selectAllBoostEvents, selectSelectedEvents } from "./events.slice";
import { selectEventsEditorBeatsPerZoomLevel } from "./lightshow.slice";
import { selectCursorPosition, selectDuration } from "./navigation.slice";
import { selectAllBombNotes, selectAllColorNotes, selectAllObstacles, selectSelectedObjects } from "./objects.slice";
import { selectBpm, selectEditorOffset, selectEventTracksForEnvironment, selectSongById } from "./songs.slice";
import { selectTimescale } from "./timeline.slice";
import { selectUserObstaclePlacementMode } from "./user.slice";

export const selectTimeProcessor = createDraftSafeSelector([selectBpm, selectTimescale], (bpm, timeline) => {
	return new TimeProcessor(bpm, timeline, 0);
});

export const selectBeatForTime = createAppDraftSafeSelector([selectTimeProcessor, selectEditorOffset, (_1, _2: SongId, time: number) => time], (timeProcessor, offset, time) => {
	return timeProcessor.toBeatTime(time - offset);
});
export const selectTimeForBeat = createAppDraftSafeSelector([selectTimeProcessor, selectEditorOffset, (_1, _2: SongId, beat: number) => beat], (timeProcessor, offset, beat) => {
	return timeProcessor.toRealTime(beat) + offset;
});

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

export const selectNotePlacementMode = createAppSelector(selectSongById, (song) => {
	if (song.modSettings.mappingExtensions?.isEnabled) return NotePlacementMode.EXTENSIONS;
	return NotePlacementMode.NORMAL;
});
export const selectObstaclePlacementMode = createAppSelector(selectSongById, selectUserObstaclePlacementMode, (song, userPlacementMode) => {
	if (song.modSettings.mappingExtensions?.isEnabled) return ObstaclePlacementMode.EXTENSIONS;
	return userPlacementMode;
});

export const selectGridSize = createAppSelector(selectSongById, selectNotesEditorTool, selectObstaclePlacementMode, (song, tool, obstaclePlacementMode) => {
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

export const selectEventsEditorStartAndEndBeat = createSelector(selectCursorPositionInBeats, selectEventsEditorBeatsPerZoomLevel, (cursorPositionInBeats, beatsPerZoomLevel) => {
	const startBeat = floorToNearest(cursorPositionInBeats ?? 0, beatsPerZoomLevel);
	return { startBeat: startBeat, numOfBeatsToShow: beatsPerZoomLevel, endBeat: startBeat + beatsPerZoomLevel };
});

export const selectNoteDensity = createSelector(selectAllColorNotes, selectDuration, (notes, duration) => {
	return calculateNps({ difficulty: { colorNotes: notes } }, duration ?? 0);
});

function createVisibleObjectsSelector<T extends IWrapBaseObject>(selector: <State extends RootState>(state: State) => T[]) {
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

export const selectAllVisibleNotes = createVisibleObjectsSelector(selectAllColorNotes);
export const selectAllVisibleBombs = createVisibleObjectsSelector(selectAllBombNotes);
export const selectAllVisibleObstacles = createVisibleObjectsSelector(selectAllObstacles);

export const selectCurrentLightStateForTrack = createAppDraftSafeSelector([selectEventsEditorStartAndEndBeat, selectEventTracksForEnvironment, (state, _songId: SongId, _beatmapId: BeatmapId, trackId: number) => selectAllBasicEventsForTrack(state, trackId)], ({ startBeat }, tracks, events): ILightState => {
	const basicEventsInWindow = events.filter((event) => event.time <= startBeat);
	const lastBasicEvent = basicEventsInWindow[basicEventsInWindow.length - 1];

	const effect = lastBasicEvent ? resolveBasicEventEffect(lastBasicEvent, tracks) : null;
	const isActive = effect && isLightEffectActive(effect);

	return {
		color: isActive ? resolveBasicEventColor(lastBasicEvent) : null,
		brightness: isActive ? (lastBasicEvent?.floatValue ?? 0) : null,
	};
});

export const selectSelectedBeatmapEntities = createAppSelector([selectSelectedObjects, selectSelectedEvents, (_, view: View) => view], (objects, events, view): Partial<Omit<App.IBeatmapEntities, "bookmarks">> => {
	return {
		notes: view === View.BEATMAP ? objects.notes : undefined,
		bombs: view === View.BEATMAP ? objects.bombs : undefined,
		obstacles: view === View.BEATMAP ? objects.obstacles : undefined,
		basicEvents: view === View.LIGHTSHOW ? events.basicEvents : undefined,
		boostEvents: view === View.LIGHTSHOW ? events.boostEvents : undefined,
	};
});

export const selectBeatmapEntities = createAppSelector([selectAllColorNotes, selectAllBombNotes, selectAllObstacles, selectAllBasicEvents, selectAllBoostEvents, selectAllBookmarks], (notes, bombs, obstacles, basicEvents, boostEvents, bookmarks): App.IBeatmapEntities => {
	return { notes, bombs, obstacles, basicEvents, boostEvents, bookmarks };
});
