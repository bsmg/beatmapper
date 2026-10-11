import { HIGHEST_PRECISION } from "$/constants";
import { selectActiveSongId } from "$/store/helpers/route.helpers";
import type { AppThunkApiConfig } from "$/store/types";
import { createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";
import { selectAllBookmarks } from "./bookmarks.slice";
import { pausePlayback, selectCursorPosition, selectDuration, selectPlaying, startPlayback, updateCursorPosition } from "./navigation.slice";
import { selectBeatForTime, selectTimeForBeat } from "./selectors";

export const togglePlayback = createThunk("togglePlayback", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	if (selectPlaying(api.getState())) {
		api.dispatch(pausePlayback());
	} else {
		api.dispatch(startPlayback());
	}
});

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

function calculateWindowJumpTarget(api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>, delta: number, overrideWindowSize?: number): number {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));
	const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);

	const windowSize = overrideWindowSize ?? durationInBeats;

	if (delta > 0) {
		return Math.ceil((cursorPositionInBeats + HIGHEST_PRECISION) / windowSize) * windowSize;
	} else {
		return Math.floor((cursorPositionInBeats - HIGHEST_PRECISION) / windowSize) * windowSize;
	}
}

export const jumpToPrevWindow = createThunk("jumpToPrevWindow", (args: { windowSize?: number }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const targetBeat = calculateWindowJumpTarget(api, -1, args.windowSize);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
export const jumpToNextWindow = createThunk("jumpToNextWindow", (args: { windowSize?: number }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const targetBeat = calculateWindowJumpTarget(api, 1, args.windowSize);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});

function calculateMarkerJumpTarget(api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>, direction: number): number {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));
	const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);

	const bookmarks = selectAllBookmarks(state);
	const markers = Array.from(new Set([0, Math.floor(durationInBeats), ...bookmarks.map((b) => b.time)])).sort((a, b) => a - b);

	if (direction > 0) {
		return markers.find((m) => m > cursorPositionInBeats) ?? Math.floor(durationInBeats);
	} else {
		return markers.toReversed().find((m) => m < cursorPositionInBeats) ?? 0;
	}
}

export const jumpToPrevMarker = createThunk("jumpToPrevMarker", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const targetBeat = calculateMarkerJumpTarget(api, -1);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
export const jumpToNextMarker = createThunk("jumpToNextMarker", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const songId = selectActiveSongId(api.extra.getRouter());

	const targetBeat = calculateMarkerJumpTarget(api, 1);
	api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
});
