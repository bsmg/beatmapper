import { createListenerMiddleware } from "@reduxjs/toolkit";

import { convertBeatsToMilliseconds, convertMillisecondsToBeats, snapToNearestBeat } from "$/helpers/audio.helpers";
import { convertFileToArrayBuffer } from "$/helpers/file.helpers";
import { AudioSample } from "$/services/audio.service";
import type { BeatmapFilestore } from "$/services/file.service";
import { Sfx } from "$/services/sfx.service";
import {
	adjustCursorPosition,
	jumpToBeat,
	leaveEditor,
	pausePlaying,
	scrollThroughSong,
	scrubEventsHeader,
	scrubWaveform,
	seekBackwards,
	seekForwards,
	selectAllInRange,
	skipToEnd,
	skipToStart,
	startLoadingSong,
	startPlaying,
	stopPlaying,
	tick,
	togglePlaying,
	updatePlaybackSpeed,
	updateSongDetails,
	updateVolume,
} from "$/store/actions";
import { getBeatsPerZoomLevel, getCursorPosition, getCursorPositionInBeats, getDuration, getIsLockedToCurrentWindow, getNotes, getPlayNoteTick, getPlaybackRate, getProcessingDelay, getSelectedSong, getSnapTo, getSongById, getVolume } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { View } from "$/types";
import { clamp, floorToNearest } from "$/utils";

function stopAndRewindAudio(audioSample: AudioSample, offset: number) {
	audioSample.setCurrentTime((offset || 0) / 1000);
}

function triggerTickerIfNecessary(state: RootState, currentBeat: number, lastBeat: number, ticker: Sfx, processingDelay: number) {
	const song = getSelectedSong(state);
	const playNoteTick = getPlayNoteTick(state);
	if (playNoteTick) {
		const delayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);
		const anyNotesWithinTimespan = getNotes(state).some((note) => note._time - delayInBeats >= lastBeat && note._time - delayInBeats < currentBeat && note._type !== 3);
		if (anyNotesWithinTimespan) {
			ticker.trigger();
		}
	}
}

function calculateIfPlaybackShouldBeCommandeered(state: RootState, currentBeat: number, lastBeat: number, processingDelay: number, view: View | null) {
	if (view !== View.LIGHTSHOW) return;
	const song = getSelectedSong(state);
	const isLockedToCurrentWindow = getIsLockedToCurrentWindow(state);
	const beatsPerZoomLevel = getBeatsPerZoomLevel(state);
	// Figure out how much time lasts between frames, on average.
	const currentTime = convertBeatsToMilliseconds(currentBeat, song.bpm);
	const lastBeatTime = convertBeatsToMilliseconds(lastBeat, song.bpm);
	const deltaInMillisecondsBetweenFrames = currentTime - lastBeatTime;
	const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);
	const windowForCurrentBeat = floorToNearest(currentBeat + processingDelayInBeats, beatsPerZoomLevel);
	const windowForLastBeat = floorToNearest(lastBeat + processingDelayInBeats, beatsPerZoomLevel);
	const justExceededWindow = windowForLastBeat < windowForCurrentBeat && deltaInMillisecondsBetweenFrames < 100;
	if (isLockedToCurrentWindow && justExceededWindow) {
		const newCursorPosition = convertBeatsToMilliseconds(windowForLastBeat, song.bpm) + song.offset;
		return newCursorPosition;
	}
}

interface Options {
	filestore: BeatmapFilestore;
}
/** This middleware manages playback concerns. */
export default function createAudioMiddleware({ filestore }: Options) {
	let animationFrameId: number;

	const ticker = new Sfx();
	const audioSample = new AudioSample(1, 1);

	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: startLoadingSong,
		effect: async (action, api) => {
			api.unsubscribe();
			const { songId } = action.payload;
			const state = api.getState();
			const song = getSongById(state, songId);
			const volume = getVolume(state);
			const playbackRate = getPlaybackRate(state);
			if (!song) {
				console.error(`Song "${songId}" not found. Current state:`, state);
				return;
			}
			const file = await filestore.loadFile<Blob>(song.songFilename);
			if (!file) return;
			const arrayBuffer = await convertFileToArrayBuffer(file);
			await audioSample.load(arrayBuffer);
			audioSample.changeVolume(volume);
			audioSample.changePlaybackRate(playbackRate);
			audioSample.setCurrentTime(song.offset / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: togglePlaying,
		effect: (_, api) => {
			const state = api.getState();
			if (state.navigation.isPlaying) {
				api.dispatch(pausePlaying());
			} else {
				api.dispatch(startPlaying());
			}
		},
	});
	instance.startListening({
		actionCreator: startPlaying,
		effect: (_, api) => {
			api.unsubscribe();
			audioSample.play();
			// Keep track of the last beat we saw, so we know which chunk of time the current tick is accessing (by looking at the delta between last and current)
			let lastBeat = 0;
			function onTick() {
				const currentTime = audioSample.getCurrentTime() * 1000;
				const state = api.getState();
				const song = getSelectedSong(state);
				const duration = getDuration(state);
				if (audioSample.isPlaying && duration && currentTime > duration) {
					return api.dispatch(pausePlaying());
				}
				const processingDelay = getProcessingDelay(state);
				const currentBeat = convertMillisecondsToBeats(currentTime - song.offset, song.bpm);
				triggerTickerIfNecessary(state, currentBeat, lastBeat, ticker, processingDelay);
				// Normally, we just want to have one frame after another, with no overriding behavior. Sometimes, though, we want to commandeer.
				// Specifically, this can be when the user enables the "Loop" lock in the event grid.
				// When the time reaches the end of the current window, it's commandeered and reset to the start of that window.
				const viewMatch = window.location.pathname.match(/\/(\w+)$/);
				const view = viewMatch ? (viewMatch[1] as View) : null;
				const commandeeredCursorPosition = calculateIfPlaybackShouldBeCommandeered(state, currentBeat, lastBeat, processingDelay, view);
				if (typeof commandeeredCursorPosition === "number") {
					api.dispatch(adjustCursorPosition({ newCursorPosition: commandeeredCursorPosition }));
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
		actionCreator: scrubWaveform,
		effect: (action, api) => {
			api.unsubscribe();
			const { newOffset } = action.payload;
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			let roundedCursorPosition = snapToNearestBeat(newOffset, song.bpm, song.offset);
			roundedCursorPosition = clamp(roundedCursorPosition, 0, duration ?? roundedCursorPosition);
			// Dispatch this new cursor position, but also seek to this place in the audio, so that it is in sync.
			api.dispatch(adjustCursorPosition({ newCursorPosition: roundedCursorPosition }));
			audioSample.setCurrentTime(roundedCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateSongDetails,
		effect: async (action, api) => {
			api.unsubscribe();
			const { songFilename, offset } = action.payload;
			if (songFilename) {
				const file = await filestore.loadFile<Blob>(songFilename);
				if (!file) return;
				const arrayBuffer = await convertFileToArrayBuffer(file);
				await audioSample.load(arrayBuffer);
				audioSample.setCurrentTime((offset ?? 0) / 1000);
			}
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrubEventsHeader,
		effect: (action, api) => {
			api.unsubscribe();
			const { selectedBeat } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			let newCursorPosition = convertBeatsToMilliseconds(selectedBeat, song.bpm) + song.offset;
			newCursorPosition = clamp(newCursorPosition, 0, duration ?? newCursorPosition);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: selectAllInRange,
		effect: (action, api) => {
			api.unsubscribe();
			const { start } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const newCursorPosition = convertBeatsToMilliseconds(start, song.bpm) + song.offset;
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			audioSample.pause();
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: jumpToBeat,
		effect: (action, api) => {
			api.unsubscribe();
			const { beatNum, pauseTrack } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			let newCursorPosition = convertBeatsToMilliseconds(beatNum, song.bpm) + song.offset;
			newCursorPosition = clamp(newCursorPosition, 0, duration ?? newCursorPosition);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
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
			const { view } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const cursorPositionInBeats = getCursorPositionInBeats(state);
			const duration = getDuration(state);
			if (cursorPositionInBeats === null || duration === null) return;
			// In events view, we always want to jump ahead to the next window. This is a bit tricky since it's not a fixed # of cells to jump.
			const beatsPerZoomLevel = getBeatsPerZoomLevel(state);
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
			let newCursorPosition = convertBeatsToMilliseconds(newStartBeat, song.bpm) + song.offset;
			newCursorPosition = clamp(newCursorPosition, 0, duration);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
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
			const song = getSelectedSong(state);
			const snapTo = getSnapTo(state);
			const cursorPosition = getCursorPosition(state);
			const duration = getDuration(state);
			if (duration === null) return;
			const { direction } = action.payload;
			// We want to jump by the amount that we're snapping to.
			const incrementInMs = convertBeatsToMilliseconds(snapTo, song.bpm);
			let newCursorPosition = direction === "forwards" ? cursorPosition + incrementInMs : cursorPosition - incrementInMs;
			newCursorPosition = clamp(newCursorPosition, 0, duration);
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
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
		actionCreator: pausePlaying,
		effect: (_, api) => {
			api.unsubscribe();
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			const state = api.getState();
			const song = getSelectedSong(state);
			const cursorPosition = getCursorPosition(state);
			const duration = getDuration(state);
			window.cancelAnimationFrame(animationFrameId);
			audioSample.pause();
			let roundedCursorPosition = snapToNearestBeat(cursorPosition, song.bpm, song.offset);
			roundedCursorPosition = clamp(roundedCursorPosition, 0, duration ?? roundedCursorPosition);
			// Dispatch this new cursor position, but also seek to this place in the audio, so that it is in sync.
			api.dispatch(adjustCursorPosition({ newCursorPosition: roundedCursorPosition }));
			audioSample.setCurrentTime(roundedCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: stopPlaying,
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
		actionCreator: skipToStart.fulfilled,
		effect: (action, api) => {
			api.unsubscribe();
			const { offset } = action.payload;
			audioSample.setCurrentTime(offset / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: skipToEnd,
		effect: (_, api) => {
			api.unsubscribe();
			// Rather than go to the literal last millisecond in the song, we'll jump 2 bars away from the very end. That seems most likely to be useful.
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			if (duration === null) return;
			const lastBeatInSong = Math.floor(convertMillisecondsToBeats(duration, song.bpm));
			const newCursorPosition = convertBeatsToMilliseconds(lastBeatInSong - 8, song.bpm) + song.offset;
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateVolume,
		effect: (action, api) => {
			api.unsubscribe();
			const { volume } = action.payload;
			audioSample.changeVolume(volume);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updatePlaybackSpeed,
		effect: (action, api) => {
			api.unsubscribe();
			const { playbackRate } = action.payload;
			audioSample.changePlaybackRate(playbackRate);
			api.subscribe();
		},
	});

	return instance.middleware;
}
