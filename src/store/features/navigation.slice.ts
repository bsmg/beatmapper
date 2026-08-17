import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { leaveEditor, reloadVisualizer, scrollThroughSong, selectAllEntitiesInRange, updateSong } from "$/store/actions";
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
		return {
			updateCursorPosition: api.reducer<{ value: number }>((state, action) => {
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
			updateSnap: api.reducer<number>((state, action) => {
				return { ...state, snapTo: action.payload };
			}),
			updateTrackScale: api.reducer<number>((state, action) => {
				return { ...state, beatDepth: action.payload, animateBlockMotion: false };
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
		builder.addCase(reloadVisualizer, (state, action) => {
			return { ...state, duration: action.payload.duration };
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
