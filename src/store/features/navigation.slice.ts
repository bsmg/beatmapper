import { type AsyncThunkPayloadCreator, type ReducerCreators, isAnyOf } from "@reduxjs/toolkit";

import { SNAPPING_INCREMENTS } from "$/constants";
import { finishLoadingMap, hydrateSession, leaveEditor, reloadVisualizer, scrollThroughSong, scrubVisualizer, selectAllEntitiesInRange, tick, updateSong } from "$/store/actions";
import type { SongId, View } from "$/types";
import { createSlice } from "../helpers";
import { selectEditorOffset } from "../selectors";
import type { RootState } from "../setup";

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

const fetchOffset: AsyncThunkPayloadCreator<{ offset: number }, { songId: SongId }> = (args, api) => {
	const state = api.getState() as RootState;
	const offset = selectEditorOffset(state, args.songId);
	return api.fulfillWithValue({ offset });
};

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
			startPlayback: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, isPlaying: true, animateBlockMotion: false, animateRingMotion: true };
			}),
			pausePlayback: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, isPlaying: false, animateBlockMotion: true, animateRingMotion: false };
			}),
			stopPlayback: api.reducer<{ offset: number }>((state, action) => {
				const { offset } = action.payload;
				return { ...state, isPlaying: true, animateBlockMotion: false, animateRingMotion: false, cursorPosition: Math.max(offset, 0) };
			}),
			jumpToBeat: api.reducer<{ songId: SongId; beatNum: number; pauseTrack?: boolean; animateJump?: boolean }>((state, action) => {
				const { pauseTrack, animateJump } = action.payload;
				// In some cases, we want to pause the track when jumping.
				// In others, we inherit whatever the current value is.
				const isPlaying = pauseTrack ? false : state.isPlaying;
				return { ...state, isPlaying, animateBlockMotion: !!animateJump, animateRingMotion: false };
			}),
			jumpToStart: api.asyncThunk(fetchOffset, {
				fulfilled: (state, action) => {
					const { offset } = action.payload;
					return { ...state, animateBlockMotion: false, animateRingMotion: false, cursorPosition: Math.max(offset, 0) };
				},
			}),
			jumpToEnd: api.reducer<{ songId: SongId }>((state) => {
				return { ...state, animateBlockMotion: false, animateRingMotion: false, cursorPosition: state.duration ?? 0 };
			}),
			jumpForwards: api.reducer<{ songId: SongId; view: View }>((state) => {
				return { ...state, animateBlockMotion: false, animateRingMotion: false };
			}),
			jumpBackwards: api.reducer<{ songId: SongId; view: View }>((state) => {
				return { ...state, animateBlockMotion: false, animateRingMotion: false };
			}),
			updateCursorPosition: api.reducer<{ value: number }>((state, action) => {
				const { value: newCursorPosition } = action.payload;
				return { ...state, cursorPosition: newCursorPosition };
			}),
			updateSnap: api.reducer<{ value: number }>((state, action) => {
				const { value: newSnapTo } = action.payload;
				return { ...state, snapTo: newSnapTo };
			}),
			incrementSnap: nextSnappingIncrement(api, { delta: 1 }),
			decrementSnap: nextSnappingIncrement(api, { delta: -1 }),
			updateTrackScale: api.reducer<{ value: number }>((state, action) => {
				const { value: beatDepth } = action.payload;
				return { ...state, beatDepth: beatDepth, animateBlockMotion: false };
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
		builder.addCase(finishLoadingMap, (state, action) => {
			const {
				songData: { offset },
			} = action.payload;
			return { ...state, cursorPosition: Math.max(offset, 0) };
		});
		builder.addCase(updateSong, (state, action) => {
			const { changes: songData } = action.payload;
			return { ...state, cursorPosition: Math.max(songData.offset ?? 0, 0) };
		});
		builder.addCase(tick, (state, action) => {
			const { timeElapsed } = action.payload;
			return { ...state, cursorPosition: timeElapsed, animateRingMotion: true };
		});
		builder.addCase(scrubVisualizer, (state, action) => {
			const { newOffset } = action.payload;
			return { ...state, cursorPosition: newOffset, animateBlockMotion: false, animateRingMotion: false };
		});
		builder.addCase(selectAllEntitiesInRange, (state) => {
			return { ...state, isPlaying: false, animateBlockMotion: false };
		});
		builder.addCase(scrollThroughSong, (state) => {
			return { ...state, animateBlockMotion: true, animateRingMotion: false };
		});
		builder.addCase(leaveEditor, (state) => {
			return { ...state, cursorPosition: 0, isPlaying: false, duration: null };
		});
		builder.addMatcher(isAnyOf(finishLoadingMap, reloadVisualizer), (state, action) => {
			const { duration } = action.payload;
			const durationInMs = duration * 1000;
			return { ...state, duration: durationInMs };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
