import { isAnyOf, type ReducerCreators } from "@reduxjs/toolkit";

import { SNAPPING_INCREMENTS } from "$/constants";
import { hydrateSession, leaveEditor, reloadVisualizer, scrollThroughSong, selectAllEntitiesInRange, updateSong } from "$/store/actions";
import { createSlice } from "$/store/helpers";
import type { SongId } from "$/types";
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
		function nextSnappingIncrement(api: ReducerCreators<typeof initialState>, options: { delta: number }) {
			return api.reducer((state) => {
				const currentSnappingIncrementIndex = SNAPPING_INCREMENTS.findIndex((increment) => increment.value === state.snapTo);
				// This shouldn't be possible, but if somehow we don't have a recognized interval, just reset to 1.
				if (currentSnappingIncrementIndex === -1) return { ...state, snapTo: 1 };
				const nextSnappingIndex = currentSnappingIncrementIndex + options.delta;
				const nextSnappingIncrement = SNAPPING_INCREMENTS[nextSnappingIndex];
				// If we're at one end of the scale and we try to push beyond it, we'll hit an undefined. Do nothing in those cases (no wrapping around desired).
				if (!nextSnappingIncrement) return state;
				return { ...state, snapTo: nextSnappingIncrement.value };
			});
		}

		return {
			updateCursorPosition: api.reducer<{ songId: SongId; value: number }>((state, action) => {
				const { value } = action.payload;
				return { ...state, cursorPosition: clamp(value, 0, state.duration ?? value) };
			}),
			tick: api.reducer<{ songId: SongId; currentTime: number; lastBeat: number; currentBeat: number }>((state, action) => {
				const { currentTime: timeElapsed } = action.payload;
				return { ...state, cursorPosition: timeElapsed };
			}),
			startPlayback: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, isPlaying: true, animateBlockMotion: false, animateRingMotion: true };
			}),
			pausePlayback: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, isPlaying: false, animateBlockMotion: true, animateRingMotion: false };
			}),
			stopPlayback: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, isPlaying: false, animateBlockMotion: false, animateRingMotion: false };
			}),
			togglePlayback: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, isPlaying: !state.isPlaying };
			}),
			jumpToTime: api.reducer<{ songId: SongId; value: number; pauseTrack?: boolean; animateJump?: boolean }>((state, action) => {
				const { animateJump } = action.payload;
				return { ...state, animateBlockMotion: !!animateJump };
			}),
			jumpToBeat: api.reducer<{ songId: SongId; value: number; pauseTrack?: boolean; animateJump?: boolean }>((state, action) => {
				const { animateJump } = action.payload;
				return { ...state, animateBlockMotion: !!animateJump };
			}),
			jumpToStart: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, animateBlockMotion: true };
			}),
			jumpToEnd: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, animateBlockMotion: true };
			}),
			jumpForwards: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, animateBlockMotion: true };
			}),
			jumpBackwards: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, animateBlockMotion: true };
			}),
			scrollThroughSong: api.reducer<{ songId: SongId; direction: "forwards" | "backwards" }>((state) => {
				return { ...state, animateBlockMotion: true };
			}),
			updateSnap: api.reducer<{ value: number }>((state, action) => {
				const { value: newSnapTo } = action.payload;
				return { ...state, snapTo: newSnapTo };
			}),
			incrementSnap: nextSnappingIncrement(api, { delta: 1 }),
			decrementSnap: nextSnappingIncrement(api, { delta: -1 }),
			updateTrackScale: api.reducer<{ value: number }>((state, action) => {
				const { value: beatDepth } = action.payload;
				return { ...state, animateBlockMotion: false, beatDepth: beatDepth };
			}),
			updatePlaybackRate: api.reducer<{ value: number }>((state, action) => {
				const { value: playbackRate } = action.payload;
				return { ...state, playbackRate: playbackRate };
			}),
			incrementPlaybackRate: api.reducer((state) => {
				return { ...state, playbackRate: Math.min(state.playbackRate + 0.25, 2) };
			}),
			decrementPlaybackRate: api.reducer((state) => {
				return { ...state, playbackRate: Math.max(state.playbackRate - 0.25, 0) };
			}),
			updateSongVolume: api.reducer<{ value: number }>((state, action) => {
				const { value: volume } = action.payload;
				return { ...state, songVolume: volume };
			}),
			updateTickVolume: api.reducer<{ value: number }>((state, action) => {
				const { value: volume } = action.payload;
				return { ...state, tickVolume: volume };
			}),
			updateTickType: api.reducer<{ value: number }>((state, action) => {
				const { value: type } = action.payload;
				return { ...state, tickType: type };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(hydrateSession, (state, action) => {
			const { "track.snap": snapTo, "track.spacing": beatDepth, "playback.rate": playbackRate, "playback.volume": songVolume, "tick.volume": tickVolume, "tick.type": tickType } = action.payload;
			if (snapTo !== undefined) state.snapTo = snapTo;
			if (beatDepth !== undefined) state.beatDepth = beatDepth;
			if (playbackRate !== undefined) state.playbackRate = playbackRate;
			if (songVolume !== undefined) state.songVolume = songVolume;
			if (tickVolume !== undefined) state.tickVolume = tickVolume;
			if (tickType !== undefined) state.tickType = tickType;
		});
		builder.addCase(reloadVisualizer, (state, action) => {
			const { duration } = action.payload;
			return { ...state, duration: duration * 1000 };
		});
		builder.addCase(leaveEditor, (state) => {
			return { ...state, duration: null };
		});
		builder.addCase(updateSong, (state, action) => {
			const { changes } = action.payload;
			if (!changes.offset) return state;
			return { ...state, cursorPosition: Math.max(changes.offset, 0) };
		});
		builder.addMatcher(isAnyOf(scrollThroughSong), (state) => {
			return { ...state, animateBlockMotion: true };
		});
		builder.addMatcher(isAnyOf(selectAllEntitiesInRange), (state) => {
			return { ...state, animateBlockMotion: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
