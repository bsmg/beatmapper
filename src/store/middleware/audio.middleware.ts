import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { tickWoodblockSfxPath } from "$/assets";
import { NOTE_TICK_TYPES } from "$/constants";
import { convertFileToArrayBuffer } from "$/helpers/file.helpers";
import { AudioSample } from "$/services/audio.service";
import type { BeatmapFilestore } from "$/services/file.service";
import { Sfx } from "$/services/sfx.service";
import {
	decrementPlaybackRate,
	hydrateSession,
	incrementPlaybackRate,
	jumpToBeat,
	jumpToEnd,
	jumpToStart,
	leaveEditor,
	pausePlayback,
	scrollThroughSong,
	scrubEventsHeader,
	scrubVisualizer,
	seekBackwards,
	seekForwards,
	selectAllEntitiesInRange,
	startLoadingMap,
	startPlayback,
	stopPlayback,
	tick,
	togglePlaying,
	updateCursorPosition,
	updatePlaybackRate,
	updateSong,
	updateSongVolume,
	updateTickType,
	updateTickVolume,
} from "$/store/actions";
import {
	selectAllColorNotes,
	selectAudioProcessingDelayInBeats,
	selectBeatForTime,
	selectCursorPosition,
	selectCursorPositionInBeats,
	selectDuration,
	selectDurationInBeats,
	selectEditorOffset,
	selectEventsEditorBeatsPerZoomLevel,
	selectEventsEditorWindowLock,
	selectNearestBeatForTime,
	selectPlaybackRate,
	selectSnap,
	selectTickVolume,
	selectTimeForBeat,
} from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type SongId, View } from "$/types";
import { clamp, floorToNearest } from "$/utils";

function stopAndRewindAudio(audioSample: AudioSample, offset: number) {
	audioSample.setCurrentTime((offset || 0) / 1000);
}

function triggerTickerIfNecessary(state: RootState, songId: SongId, currentBeat: number, lastBeat: number, ticker: Sfx) {
	const playNoteTick = selectTickVolume(state);
	if (playNoteTick) {
		const delayInBeats = selectAudioProcessingDelayInBeats(state, songId);
		const anyNotesWithinTimespan = selectAllColorNotes(state).some((note) => note.time - delayInBeats >= lastBeat && note.time - delayInBeats < currentBeat);
		if (anyNotesWithinTimespan) {
			ticker.trigger();
		}
	}
}

function calculateIfPlaybackShouldBeCommandeered(state: RootState, songId: SongId, currentBeat: number, lastBeat: number, view: View | null) {
	if (view !== View.LIGHTSHOW) return;
	const isLockedToCurrentWindow = selectEventsEditorWindowLock(state);
	const beatsPerZoomLevel = selectEventsEditorBeatsPerZoomLevel(state);
	// Figure out how much time lasts between frames, on average.
	const currentTime = selectTimeForBeat(state, songId, currentBeat, { withOffset: false });
	const lastBeatTime = selectTimeForBeat(state, songId, lastBeat, { withOffset: false });
	const deltaInMillisecondsBetweenFrames = currentTime - lastBeatTime;
	const processingDelayInBeats = selectAudioProcessingDelayInBeats(state, songId);
	const windowForCurrentBeat = floorToNearest(currentBeat + processingDelayInBeats, beatsPerZoomLevel);
	const windowForLastBeat = floorToNearest(lastBeat + processingDelayInBeats, beatsPerZoomLevel);
	const justExceededWindow = windowForLastBeat < windowForCurrentBeat && deltaInMillisecondsBetweenFrames < 100;
	if (isLockedToCurrentWindow && justExceededWindow) {
		const newCursorPosition = selectTimeForBeat(state, songId, windowForLastBeat);
		return newCursorPosition;
	}
}

interface Options {
	filestore: BeatmapFilestore;
}
/** This middleware manages playback concerns. */
export default function createAudioMiddleware({ filestore }: Options) {
	let animationFrameId: number;

	const ticker = new Sfx(tickWoodblockSfxPath, { volume: 1, playbackRate: 1 });
	const audioSample = new AudioSample({ volume: 1, playbackRate: 1 });

	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: hydrateSession,
		effect: async (action, api) => {
			api.unsubscribe();
			const { "playback.rate": playbackRate, "playback.volume": songVolume, "tick.volume": tickVolume, "tick.type": tickType } = action.payload;
			if (playbackRate !== undefined) audioSample.changePlaybackRate(playbackRate);
			if (songVolume !== undefined) audioSample.changeVolume(songVolume);
			if (tickVolume !== undefined) ticker.audioSample.changeVolume(tickVolume);
			if (tickType !== undefined) ticker.audioSample.load(NOTE_TICK_TYPES[tickType]);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: startLoadingMap,
		effect: async (action, api) => {
			api.unsubscribe();
			const { songId } = action.payload;
			const state = api.getState();
			const offset = selectEditorOffset(state, songId);
			const file = await filestore.loadSongFile(songId);
			const arrayBuffer = await convertFileToArrayBuffer(file);
			await audioSample.loadFromArrayBuffer(arrayBuffer);
			audioSample.setCurrentTime(offset / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: togglePlaying,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			if (state.navigation.isPlaying) {
				api.dispatch(pausePlayback({ songId }));
			} else {
				api.dispatch(startPlayback({ songId }));
			}
		},
	});
	instance.startListening({
		actionCreator: startPlayback,
		effect: (action, api) => {
			api.unsubscribe();
			audioSample.play();
			// Keep track of the last beat we saw, so we know which chunk of time the current tick is accessing (by looking at the delta between last and current)
			let lastBeat = 0;
			const state = api.getState();
			const { songId } = action.payload;
			const duration = selectDuration(state);
			const viewMatch = window.location.pathname.match(/\/(\w+)$/);
			const view = viewMatch ? (viewMatch[1] as View) : null;
			function onTick() {
				const currentTime = audioSample.getCurrentTime() * 1000;
				if (audioSample.isPlaying && duration && currentTime > duration) {
					return api.dispatch(pausePlayback({ songId }));
				}
				const currentBeat = selectBeatForTime(state, songId, currentTime);
				triggerTickerIfNecessary(state, songId, currentBeat, lastBeat, ticker);
				// Normally, we just want to have one frame after another, with no overriding behavior. Sometimes, though, we want to commandeer.
				// Specifically, this can be when the user enables the "Loop" lock in the event grid.
				// When the time reaches the end of the current window, it's commandeered and reset to the start of that window.
				const commandeeredCursorPosition = calculateIfPlaybackShouldBeCommandeered(state, songId, currentBeat, lastBeat, view);
				if (typeof commandeeredCursorPosition === "number") {
					api.dispatch(updateCursorPosition({ value: commandeeredCursorPosition }));
					audioSample.setCurrentTime(commandeeredCursorPosition / 1000);
				} else {
					api.dispatch(tick({ timeElapsed: currentTime }));
				}
				lastBeat = currentBeat;
				animationFrameId = window.requestAnimationFrame(() => onTick());
			}
			animationFrameId = window.requestAnimationFrame(() => onTick());
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrubVisualizer,
		effect: (action, api) => {
			api.unsubscribe();
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			const state = api.getState();
			const { songId, newOffset } = action.payload;
			const duration = selectDuration(state);
			let roundedCursorPosition = selectNearestBeatForTime(state, songId, newOffset);
			roundedCursorPosition = clamp(roundedCursorPosition, 0, duration ?? roundedCursorPosition);
			// Dispatch this new cursor position, but also seek to this place in the audio, so that it is in sync.
			api.dispatch(updateCursorPosition({ value: roundedCursorPosition }));
			audioSample.setCurrentTime(roundedCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateSong,
		effect: async (action, api) => {
			api.unsubscribe();
			const { songId, changes: songData } = action.payload;
			if (!songData.songFilename) return;
			const file = await filestore.loadSongFile(songId);
			const arrayBuffer = await convertFileToArrayBuffer(file);
			await audioSample.loadFromArrayBuffer(arrayBuffer);
			audioSample.setCurrentTime((songData.offset ?? 0) / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrubEventsHeader,
		effect: (action, api) => {
			api.unsubscribe();
			const state = api.getState();
			const { songId, selectedBeat } = action.payload;
			const duration = selectDuration(state);
			let newCursorPosition = selectTimeForBeat(state, songId, selectedBeat);
			newCursorPosition = clamp(newCursorPosition, 0, duration ?? newCursorPosition);
			api.dispatch(updateCursorPosition({ value: newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: selectAllEntitiesInRange,
		effect: (action, api) => {
			api.unsubscribe();
			const state = api.getState();
			const { songId, start } = action.payload;
			const newCursorPosition = selectTimeForBeat(state, songId, start);
			api.dispatch(updateCursorPosition({ value: newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			audioSample.pause();
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: jumpToBeat,
		effect: (action, api) => {
			api.unsubscribe();
			const state = api.getState();
			const { songId, beatNum, pauseTrack } = action.payload;
			const duration = selectDuration(state);
			let newCursorPosition = selectTimeForBeat(state, songId, beatNum);
			newCursorPosition = clamp(newCursorPosition, 0, duration ?? newCursorPosition);
			api.dispatch(updateCursorPosition({ value: newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			if (pauseTrack) {
				audioSample.pause();
			}
			api.subscribe();
		},
	});
	instance.startListening({
		matcher: (action) => seekForwards.match(action) || seekBackwards.match(action),
		effect: (action, api) => {
			api.unsubscribe();
			const state = api.getState();
			const { songId, view } = action.payload;
			const cursorPositionInBeats = selectCursorPositionInBeats(state, songId);
			const duration = selectDuration(state);
			if (cursorPositionInBeats === null || duration === null) return;
			// In events view, we always want to jump ahead to the next window. This is a bit tricky since it's not a fixed # of cells to jump.
			const beatsPerZoomLevel = selectEventsEditorBeatsPerZoomLevel(state);
			const windowSize = view === View.LIGHTSHOW ? beatsPerZoomLevel : 32;
			const currentWindowIndex = Math.floor(cursorPositionInBeats / windowSize);
			let newStartBeat: number;
			if (seekForwards.match(action)) {
				newStartBeat = windowSize * (currentWindowIndex + 1);
			} else {
				// In notes view, this should work like the next/previous buttons on CD players.
				// If you click 'previous', it "rewinds" to the start of the current window, unless you're in the first couple beats, in which case it rewinds to the previous window.
				const progressThroughWindow = cursorPositionInBeats % windowSize;
				if (progressThroughWindow < 2) {
					newStartBeat = windowSize * (currentWindowIndex - 1);
				} else {
					newStartBeat = windowSize * currentWindowIndex;
				}
			}
			let newCursorPosition = selectTimeForBeat(state, songId, newStartBeat);
			newCursorPosition = clamp(newCursorPosition, 0, duration);
			api.dispatch(updateCursorPosition({ value: newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrollThroughSong,
		effect: (action, api) => {
			api.unsubscribe();
			// If the song isn't loaded yet, ignore this action. This can happen if the user starts scrolling before the song has loaded.
			if (!audioSample) return;
			const state = api.getState();
			const snapTo = selectSnap(state);
			const cursorPosition = selectCursorPosition(state);
			const duration = selectDuration(state);
			if (duration === null) return;
			const { songId, direction } = action.payload;
			// We want to jump by the amount that we're snapping to.
			const incrementInMs = selectTimeForBeat(state, songId, snapTo, { withOffset: false });
			let newCursorPosition = direction === "forwards" ? cursorPosition + incrementInMs : cursorPosition - incrementInMs;
			newCursorPosition = clamp(newCursorPosition, 0, duration);
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.dispatch(updateCursorPosition({ value: newCursorPosition }));
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: leaveEditor,
		effect: (_, api) => {
			api.unsubscribe();
			window.cancelAnimationFrame(animationFrameId);
			audioSample.pause();
			audioSample.setCurrentTime(0);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: pausePlayback,
		effect: (action, api) => {
			api.unsubscribe();
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			const state = api.getState();
			const { songId } = action.payload;
			const cursorPosition = selectCursorPosition(state);
			const duration = selectDuration(state);
			window.cancelAnimationFrame(animationFrameId);
			audioSample.pause();
			let roundedCursorPosition = selectNearestBeatForTime(state, songId, cursorPosition);
			roundedCursorPosition = clamp(roundedCursorPosition, 0, duration ?? roundedCursorPosition);
			// Dispatch this new cursor position, but also seek to this place in the audio, so that it is in sync.
			api.dispatch(updateCursorPosition({ value: roundedCursorPosition }));
			audioSample.setCurrentTime(roundedCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: stopPlayback,
		effect: (action, api) => {
			api.unsubscribe();
			const { offset } = action.payload;
			window.cancelAnimationFrame(animationFrameId);
			if (audioSample) {
				audioSample.pause();
				stopAndRewindAudio(audioSample, offset);
			}
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: jumpToStart.fulfilled,
		effect: (action, api) => {
			api.unsubscribe();
			const { offset } = action.payload;
			audioSample.setCurrentTime(offset / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: jumpToEnd,
		effect: (action, api) => {
			api.unsubscribe();
			const state = api.getState();
			const { songId } = action.payload;
			const duration = selectDurationInBeats(state, songId);
			if (duration === null) return;
			const lastBeatInSong = Math.floor(duration);
			// Rather than go to the literal last millisecond in the song, we'll jump 1 beat away from the very end. That seems most likely to be useful.
			const newCursorPosition = selectTimeForBeat(state, songId, lastBeatInSong);
			api.dispatch(updateCursorPosition({ value: newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		matcher: isAnyOf(updatePlaybackRate, incrementPlaybackRate, decrementPlaybackRate),
		effect: (_, api) => {
			api.unsubscribe();
			const state = api.getState();
			const playbackRate = selectPlaybackRate(state);
			audioSample.changePlaybackRate(playbackRate);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateSongVolume,
		effect: (action, api) => {
			api.unsubscribe();
			const { value: volume } = action.payload;
			audioSample.changeVolume(volume);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateTickVolume,
		effect: (action, api) => {
			api.unsubscribe();
			const { value: volume } = action.payload;
			ticker.audioSample.changeVolume(volume);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateTickType,
		effect: (action, api) => {
			api.unsubscribe();
			const { value: type } = action.payload;
			ticker.audioSample.load(NOTE_TICK_TYPES[type]);
			api.subscribe();
		},
	});

	return instance.middleware;
}
