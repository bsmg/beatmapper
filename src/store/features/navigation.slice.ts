import { createAction, createSlice } from "@reduxjs/toolkit";

import { SNAPPING_INCREMENT_VALUES } from "$/constants/editor.constants";
import type { AppThunkApiConfig } from "$/store/types";
import { createIncrementByIndexPayloadActionCreator, createIncrementByValuePayloadActionCreator, createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";
import { clamp } from "$/utils";
import { leaveEditor, loadSongFile } from "./actions";

const initialState = {
	isPlaying: false,
	cursorPosition: 0,
	duration: null as number | null,
	snapTo: 0.5,
	beatDepth: 9,
	animateBlockMotion: true,
	animateRingMotion: true,
	songVolume: 0.75,
	tickVolume: 0.75,
	tickType: 0,
	playbackRate: 1,
};

const slice = createSlice({
	name: "navigation",
	initialState: initialState,
	selectors: {
		selectPlaying: (state) => state.isPlaying,
		selectCursorPosition: (state) => state.cursorPosition,
		selectDuration: (state) => state.duration,
		selectSnap: (state) => state.snapTo,
		selectBeatDepth: (state) => state.beatDepth,
		selectAnimateTrack: (state) => state.animateBlockMotion,
		selectAnimateEnvironment: (state) => state.animateRingMotion,
		selectPlaybackRate: (state) => state.playbackRate,
		selectSongVolume: (state) => state.songVolume,
		selectTickVolume: (state) => state.tickVolume,
		selectTickType: (state) => state.tickType,
	},
	reducers: (api) => {
		return {
			updateCursorPosition: api.reducer<number>((state, action) => {
				return { ...state, cursorPosition: clamp(action.payload, 0, state.duration ?? action.payload), animateBlockMotion: true };
			}),
			startPlayback: api.reducer((state) => {
				return { ...state, isPlaying: true, animateBlockMotion: false, animateRingMotion: true };
			}),
			pausePlayback: api.reducer((state) => {
				return { ...state, isPlaying: false, animateBlockMotion: true, animateRingMotion: false };
			}),
			stopPlayback: api.reducer((state) => {
				return { ...state, isPlaying: false, animateBlockMotion: false, animateRingMotion: false };
			}),
			updateSnap: api.reducer<number>((state, action) => {
				return { ...state, snapTo: action.payload };
			}),
			updateTrackScale: api.reducer<number>((state, action) => {
				return { ...state, beatDepth: action.payload };
			}),
			updatePlaybackRate: api.reducer<number>((state, action) => {
				return { ...state, playbackRate: action.payload };
			}),
			updateSongVolume: api.reducer<number>((state, action) => {
				return { ...state, songVolume: action.payload };
			}),
			updateTickVolume: api.reducer<number>((state, action) => {
				return { ...state, tickVolume: action.payload };
			}),
			updateTickType: api.reducer<number>((state, action) => {
				return { ...state, tickType: action.payload };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadSongFile.fulfilled, (state, action) => {
			return { ...state, duration: action.payload.duration };
		});
		builder.addCase(leaveEditor, (state) => {
			return { ...state, duration: null };
		});
		builder.addCase(tick, (state, action) => {
			return { ...state, cursorPosition: action.payload.cursorPosition };
		});
		builder.addDefaultCase((state) => state);
	},
});

export const { selectPlaying, selectCursorPosition, selectDuration, selectSnap, selectBeatDepth, selectAnimateTrack, selectAnimateEnvironment, selectPlaybackRate, selectSongVolume, selectTickVolume, selectTickType } = slice.getSelectors(slice.selectSlice);

export const { updateCursorPosition, startPlayback, pausePlayback, stopPlayback, updateTrackScale, updatePlaybackRate, updateSongVolume, updateTickVolume, updateTickType, updateSnap } = slice.actions;

export const tick = createAction("tick", (args: { cursorPosition: number; lastBeat: number; currentBeat: number }) => {
	return { payload: { ...args } };
});

export const incrementSnap = createThunk("incrementSnap", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByIndexPayloadActionCreator(SNAPPING_INCREMENT_VALUES, selectSnap, updateSnap)({ delta: 1 }, api);
});
export const decrementSnap = createThunk("decrementSnap", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByIndexPayloadActionCreator(SNAPPING_INCREMENT_VALUES, selectSnap, updateSnap)({ delta: -1 }, api);
});

export const incrementPlaybackRate = createThunk("incrementPlaybackRate", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByValuePayloadActionCreator([0, 2], selectPlaybackRate, updatePlaybackRate)({ delta: 0.25 }, api);
});
export const decrementPlaybackRate = createThunk("decrementPlaybackRate", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByValuePayloadActionCreator([0, 2], selectPlaybackRate, updatePlaybackRate)({ delta: -0.25 }, api);
});

export const incrementSongVolume = createThunk("incrementSongVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByValuePayloadActionCreator([0, 1], selectSongVolume, updateSongVolume)({ delta: 0.125 }, api);
});
export const decrementSongVolume = createThunk("decrementSongVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByValuePayloadActionCreator([0, 1], selectSongVolume, updateSongVolume)({ delta: -0.125 }, api);
});

export const incrementTickVolume = createThunk("incrementTickVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByValuePayloadActionCreator([0, 1], selectTickVolume, updateTickVolume)({ delta: 0.125 }, api);
});
export const decrementTickVolume = createThunk("decrementTickVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementByValuePayloadActionCreator([0, 1], selectTickVolume, updateTickVolume)({ delta: -0.125 }, api);
});

export default slice;
