import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { SNAPPING_INCREMENTS } from "$/constants";
import {
	adjustCursorPosition,
	changeSnapping,
	decrementSnapping,
	finishLoadingSong,
	hydrateSession,
	incrementSnapping,
	jumpToBeat,
	leaveEditor,
	pausePlaying,
	reloadWaveform,
	scrollThroughSong,
	scrubWaveform,
	seekBackwards,
	seekForwards,
	selectAllInRange,
	skipToEnd,
	skipToStart,
	startPlaying,
	stopPlaying,
	tick,
	toggleNoteTick,
	updateBeatDepth,
	updatePlaybackSpeed,
	updateSongDetails,
	updateVolume,
} from "$/store/actions";

const initialState = {
	isPlaying: false,
	duration: null as number | null,
	snapTo: 0.5,
	cursorPosition: 0,
	animateBlockMotion: true,
	animateRingMotion: true,
	playbackRate: 1,
	beatDepth: 9,
	volume: 0.75,
	playNoteTick: false,
};

const slice = createSlice({
	name: "navigation",
	initialState: initialState,
	selectors: {
		selectIsPlaying: (state) => state.isPlaying,
		selectDuration: (state) => state.duration,
		selectSnapTo: (state) => state.snapTo,
		selectCursorPosition: (state) => state.cursorPosition,
		selectPlaybackRate: (state) => state.playbackRate,
		selectBeatDepth: (state) => state.beatDepth,
		selectVolume: (state) => state.volume,
		selectPlayNoteTick: (state) => state.playNoteTick,
		selectAnimateBlockMotion: (state) => state.animateBlockMotion,
		selectAnimateRingMotion: (state) => state.animateRingMotion,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateSession, (state, action) => {
			const { "track.snap": snapTo, "track.spacing": beatDepth, "playback.rate": playbackRate, "playback.volume": volume, "playback.tick": playNoteTick } = action.payload;
			if (snapTo !== undefined) state.snapTo = snapTo;
			if (beatDepth !== undefined) state.beatDepth = beatDepth;
			if (playbackRate !== undefined) state.playbackRate = playbackRate;
			if (volume !== undefined) state.volume = volume;
			if (playNoteTick !== undefined) state.playNoteTick = playNoteTick;
		});
		builder.addCase(finishLoadingSong, (state, action) => {
			const {
				songData: { offset },
				duration,
			} = action.payload;
			const durationInMs = duration * 1000;
			return { ...state, cursorPosition: Math.max(offset, 0), duration: durationInMs };
		});
		builder.addCase(reloadWaveform, (state, action) => {
			const { duration } = action.payload;
			const durationInMs = duration * 1000;
			return { ...state, duration: durationInMs };
		});
		builder.addCase(updateSongDetails, (state, action) => {
			const { songData } = action.payload;
			return { ...state, cursorPosition: Math.max(songData.offset ?? 0, 0) };
		});
		builder.addCase(startPlaying, (state) => {
			return { ...state, isPlaying: true, animateBlockMotion: false, animateRingMotion: true };
		});
		builder.addCase(pausePlaying, (state) => {
			return { ...state, isPlaying: false, animateBlockMotion: true, animateRingMotion: false };
		});
		builder.addCase(stopPlaying, (state, action) => {
			const { offset } = action.payload;
			return { ...state, isPlaying: false, animateBlockMotion: false, animateRingMotion: false, cursorPosition: Math.max(offset, 0) };
		});
		builder.addCase(adjustCursorPosition, (state, action) => {
			const { newCursorPosition } = action.payload;
			return { ...state, cursorPosition: newCursorPosition };
		});
		builder.addCase(tick, (state, action) => {
			const { timeElapsed } = action.payload;
			return { ...state, cursorPosition: timeElapsed, animateRingMotion: true };
		});
		builder.addCase(scrubWaveform, (state, action) => {
			const { newOffset } = action.payload;
			return { ...state, cursorPosition: newOffset, animateBlockMotion: false, animateRingMotion: false };
		});
		builder.addCase(jumpToBeat, (state, action) => {
			const { pauseTrack, animateJump } = action.payload;
			// In some cases, we want to pause the track when jumping.
			// In others, we inherit whatever the current value is.
			const isPlaying = pauseTrack ? false : state.isPlaying;
			return { ...state, isPlaying, animateBlockMotion: !!animateJump, animateRingMotion: false };
		});
		builder.addCase(selectAllInRange, (state) => {
			return { ...state, isPlaying: false, animateBlockMotion: false };
		});
		builder.addCase(scrollThroughSong, (state) => {
			return { ...state, animateBlockMotion: true, animateRingMotion: false };
		});
		builder.addCase(skipToStart.fulfilled, (state, action) => {
			const { offset } = action.payload;
			return { ...state, animateBlockMotion: false, animateRingMotion: false, cursorPosition: Math.max(offset, 0) };
		});
		builder.addCase(skipToEnd, (state) => {
			return { ...state, animateBlockMotion: false, animateRingMotion: false, cursorPosition: state.duration ?? 0 };
		});
		builder.addCase(updateVolume, (state, action) => {
			const { volume } = action.payload;
			return { ...state, volume: volume };
		});
		builder.addCase(updatePlaybackSpeed, (state, action) => {
			const { playbackRate } = action.payload;
			return { ...state, playbackRate: playbackRate };
		});
		builder.addCase(updateBeatDepth, (state, action) => {
			const { beatDepth } = action.payload;
			return { ...state, beatDepth: beatDepth, animateBlockMotion: false };
		});
		builder.addCase(changeSnapping, (state, action) => {
			const { newSnapTo } = action.payload;
			return { ...state, snapTo: newSnapTo };
		});
		builder.addCase(toggleNoteTick, (state) => {
			return { ...state, playNoteTick: !state.playNoteTick };
		});
		builder.addCase(leaveEditor, (state) => {
			return { ...state, cursorPosition: 0, isPlaying: false, duration: null };
		});
		builder.addMatcher(isAnyOf(seekForwards, seekBackwards), (state) => {
			return { ...state, animateBlockMotion: false, animateRingMotion: false };
		});
		builder.addMatcher(isAnyOf(incrementSnapping, decrementSnapping), (state, action) => {
			const currentSnappingIncrementIndex = SNAPPING_INCREMENTS.findIndex((increment) => increment.value === state.snapTo);
			// This shouldn't be possible, but if somehow we don't have a recognized interval, just reset to 1.
			if (currentSnappingIncrementIndex === -1) return { ...state, snapTo: 1 };
			const nextSnappingIndex = incrementSnapping.match(action) ? currentSnappingIncrementIndex + 1 : currentSnappingIncrementIndex - 1;
			const nextSnappingIncrement = SNAPPING_INCREMENTS[nextSnappingIndex];
			// If we're at one end of the scale and we try to push beyond it, we'll hit an undefined. Do nothing in those cases (no wrapping around desired).
			if (!nextSnappingIncrement) return state;
			return { ...state, snapTo: nextSnappingIncrement.value };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
