import { selectActiveSongId, selectActiveView } from "$/store/helpers/route.helpers";
import type { AppThunkApiConfig } from "$/store/types";
import { createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";
import { View } from "$/types";
import { selectEventsEditorBeatsPerZoomLevel } from "./lightshow.slice";
import { pausePlayback, selectCursorPosition, selectDuration, selectPlaying, selectSnap, startPlayback, updateCursorPosition } from "./navigation.slice";
import { selectBeatForTime, selectTimeForBeat } from "./selectors";

export const togglePlayback = createThunk("togglePlayback", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	if (selectPlaying(api.getState())) {
		api.dispatch(pausePlayback());
	} else {
		api.dispatch(startPlayback());
	}
});

function calculateJumpTargetBeat(api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>, delta: number, overrideWindowSize?: number): number {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);
	const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));

	const windowSize = overrideWindowSize ?? durationInBeats;

	if (!Number.isFinite(delta)) {
		return delta < 0 ? 0 : durationInBeats;
	}

	if (delta > 0) {
		const nextBoundary = Math.ceil((cursorPositionInBeats + 0.0001) / windowSize) * windowSize;
		const target = Math.abs(nextBoundary - cursorPositionInBeats) < 0.0001 ? cursorPositionInBeats + windowSize : nextBoundary;
		return Math.min(target, durationInBeats);
	} else {
		const prevBoundary = Math.floor((cursorPositionInBeats - 0.0001) / windowSize) * windowSize;
		return Math.abs(prevBoundary - cursorPositionInBeats) < 0.0001 ? cursorPositionInBeats - windowSize : prevBoundary;
	}
}

export const jumpToTime = createThunk("jumpToTime", (args: { value: number }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());
	const targetBeat = Math.round(selectBeatForTime(state, songId, args.value));

	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
export const jumpToBeat = createThunk("jumpToBeat", (args: { value: number }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, args.value)));
});

export const moveForwards = createThunk("moveForwards", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const snapTo = selectSnap(state);
	const targetBeat = calculateJumpTargetBeat(api, 1, snapTo);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
export const moveBackwards = createThunk("moveBackwards", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const snapTo = selectSnap(state);
	const targetBeat = calculateJumpTargetBeat(api, -1, snapTo);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});

export const jumpForwards = createThunk("jumpForwards", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());
	const view = selectActiveView(api.extra.getRouter());

	const windowSize = view === View.LIGHTSHOW ? selectEventsEditorBeatsPerZoomLevel(state) : 32;
	const targetBeat = calculateJumpTargetBeat(api, 1, windowSize);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
export const jumpBackwards = createThunk("jumpBackwards", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());
	const view = selectActiveView(api.extra.getRouter());

	const windowSize = view === View.LIGHTSHOW ? selectEventsEditorBeatsPerZoomLevel(state) : 32;
	const targetBeat = calculateJumpTargetBeat(api, -1, windowSize);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});

export const jumpToStart = createThunk("jumpToStart", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const targetBeat = calculateJumpTargetBeat(api, -Infinity);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
export const jumpToEnd = createThunk("jumpToEnd", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const targetBeat = calculateJumpTargetBeat(api, Infinity);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
