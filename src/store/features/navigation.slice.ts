import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { jumpBackwards, jumpForwards, jumpToBeat, jumpToEnd, jumpToStart, jumpToTime, leaveEditor, loadSongFile, moveBackwards, moveForwards, tick } from "$/store/actions";
import { clamp } from "$/utils";

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
				return { ...state, cursorPosition: clamp(action.payload, 0, state.duration ?? action.payload) };
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
		builder.addMatcher(isAnyOf(moveForwards, moveBackwards, jumpToTime, jumpToBeat, jumpToStart, jumpToEnd, jumpForwards, jumpBackwards), (state) => {
			return { ...state, animateBlockMotion: true };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
