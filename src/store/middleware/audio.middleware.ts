import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { NOTE_TICK_TYPES } from "$/constants";
import { convertFileToArrayBuffer } from "$/helpers/file.helpers";
import { getRouter } from "$/router";
import { AudioSample } from "$/services/audio.service";
import { getAppBeatmapFilestore } from "$/setup";
import {
	decrementPlaybackRate,
	finishLoadingMap,
	hydrateSession,
	incrementPlaybackRate,
	jumpToBeat,
	jumpToEnd,
	jumpToStart,
	jumpToTime,
	pausePlayback,
	scrollThroughSong,
	seekBackwards,
	seekForwards,
	startPlayback,
	stopPlayback,
	tick,
	togglePlayback,
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
	selectEditorOffsetInBeats,
	selectEventsEditorBeatsPerZoomLevel,
	selectEventsEditorWindowLock,
	selectNearestBeat,
	selectPlaybackRate,
	selectPlaying,
	selectSnap,
	selectTickVolume,
	selectTimeForBeat,
} from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";

function getTickSchedule(state: RootState, songId: SongId): number[] {
	const notes = selectAllColorNotes(state);
	const editorOffset = selectEditorOffsetInBeats(state, songId);
	const delayInBeats = selectAudioProcessingDelayInBeats(state, songId);

	return notes.map((note) => note.time - delayInBeats + editorOffset).sort((a, b) => a - b);
}

function calculateIfPlaybackShouldBeCommandeered(state: RootState, songId: SongId, currentBeat: number, lastBeat: number) {
	const beatsPerZoomLevel = selectEventsEditorBeatsPerZoomLevel(state);
	const editorOffset = selectEditorOffsetInBeats(state, songId);

	const normalizedCurrentBeat = currentBeat - editorOffset;
	const normalizedLastBeat = lastBeat - editorOffset;

	const currentTime = selectTimeForBeat(state, songId, normalizedCurrentBeat);
	const lastBeatTime = selectTimeForBeat(state, songId, normalizedLastBeat);

	const windowForCurrentBeat = floorToNearest(normalizedCurrentBeat, beatsPerZoomLevel);
	const windowForLastBeat = floorToNearest(normalizedLastBeat, beatsPerZoomLevel);

	const justExceededWindow = windowForLastBeat < windowForCurrentBeat && currentTime - lastBeatTime < 100;

	if (selectEventsEditorWindowLock(state) && justExceededWindow) {
		return selectTimeForBeat(state, songId, windowForLastBeat + editorOffset);
	}
}

/** This middleware manages playback concerns. */
export default function createAudioMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	let animationFrameId: number;

	const filestore = getAppBeatmapFilestore();
	const router = getRouter();

	const audioSample = new AudioSample({ volume: 1, playbackRate: 1 });
	const tickSample = new AudioSample({ volume: 1, playbackRate: 1 });

	tickSample.load(NOTE_TICK_TYPES[0]);

	let tickSchedule: number[] = [];

	instance.startListening({
		actionCreator: hydrateSession,
		effect: async (action) => {
			const { "playback.rate": playbackRate, "playback.volume": songVolume, "tick.volume": tickVolume, "tick.type": tickType } = action.payload;
			if (playbackRate !== undefined) audioSample.changePlaybackRate(playbackRate);
			if (songVolume !== undefined) audioSample.changeVolume(songVolume);
			if (tickVolume !== undefined) tickSample.changeVolume(tickVolume);
			if (tickType !== undefined) tickSample.load(NOTE_TICK_TYPES[tickType]);
		},
	});
	instance.startListening({
		actionCreator: updateCursorPosition,
		effect: async (action) => {
			const { value } = action.payload;
			audioSample.setCurrentTime(value / 1000);
		},
	});
	instance.startListening({
		matcher: isAnyOf(finishLoadingMap, updateSong),
		effect: async (action: PayloadAction<{ songId: SongId; songFile?: File }>, api) => {
			const { songId, songFile } = action.payload;

			if (!finishLoadingMap.match(action)) {
				// We want to stop & reset the song when the user goes to edit it.
				// In addition to seeming like a reasonable idea, it helps prevent any weirdness around editing the audio file when it's in a non-zero position.
				api.dispatch(stopPlayback({ songId }));
			}

			if (finishLoadingMap.match(action) || songFile) {
				const file = await filestore.loadSongFile(songId);
				const arrayBuffer = await convertFileToArrayBuffer(file);
				await audioSample.loadFromArrayBuffer(arrayBuffer);
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(finishLoadingMap, startPlayback),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();

			tickSchedule = getTickSchedule(state, songId);
		},
	});
	instance.startListening({
		matcher: isAnyOf(pausePlayback, stopPlayback),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const offsetInBeats = selectEditorOffsetInBeats(state, songId);

			window.cancelAnimationFrame(animationFrameId);
			audioSample.pause();

			const newValue = pausePlayback.match(action) ? selectNearestBeat(state, songId, selectCursorPosition(state)) : selectTimeForBeat(state, songId, 0 + offsetInBeats);
			api.dispatch(updateCursorPosition({ value: newValue }));
		},
	});
	instance.startListening({
		actionCreator: startPlayback,
		effect: (action, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const duration = selectDuration(state);

			let lastBeat = 0;

			audioSample.play();

			const onTick = () => {
				const currentTime = audioSample.getCurrentTime() * 1000;
				const currentBeat = selectBeatForTime(state, songId, currentTime);

				if (audioSample.isPlaying && duration && currentTime > duration) {
					api.dispatch(stopPlayback({ songId }));
					return;
				}

				const { context } = router.state.matches[router.state.matches.length - 1];

				if ("view" in context) {
					switch (context.view) {
						case View.PREVIEW:
						case View.BEATMAP: {
							if (selectTickVolume(state) > 0 && tickSchedule.some((beat) => beat >= lastBeat && beat < currentBeat)) {
								tickSample.trigger();
							}
							break;
						}
						case View.LIGHTSHOW: {
							const commandeeredPosition = calculateIfPlaybackShouldBeCommandeered(state, songId, currentBeat, lastBeat);

							if (commandeeredPosition) {
								api.dispatch(updateCursorPosition({ value: commandeeredPosition }));
							}
							break;
						}
					}
				}

				api.dispatch(tick({ timeElapsed: currentTime }));

				lastBeat = currentBeat;
				animationFrameId = window.requestAnimationFrame(onTick);
			};

			animationFrameId = window.requestAnimationFrame(onTick);
		},
	});
	instance.startListening({
		actionCreator: togglePlayback,
		effect: (action, api) => {
			const { songId } = action.payload;

			if (selectPlaying(api.getOriginalState())) {
				api.dispatch(pausePlayback({ songId }));
			} else {
				api.dispatch(startPlayback({ songId }));
			}
		},
	});
	instance.startListening({
		actionCreator: jumpToTime,
		effect: (action, api) => {
			const { songId, value: time, pauseTrack } = action.payload;

			const state = api.getState();
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			api.dispatch(updateCursorPosition({ value: selectNearestBeat(state, songId, time) }));

			if (pauseTrack) {
				api.dispatch(pausePlayback({ songId }));
			}
		},
	});
	instance.startListening({
		actionCreator: jumpToBeat,
		effect: (action, api) => {
			const { songId, value: beatNum, pauseTrack } = action.payload;
			const state = api.getState();
			const offsetInBeats = selectEditorOffsetInBeats(state, songId);

			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, beatNum + offsetInBeats) }));

			if (pauseTrack) {
				api.dispatch(pausePlayback({ songId }));
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(jumpToStart, jumpToEnd),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const durationInBeats = selectDurationInBeats(state, songId);
			if (durationInBeats === null) return;
			const offsetInBeats = selectEditorOffsetInBeats(state, songId);
			// if we're jumping to the end, round to the last beat.
			const newValue = Math.round(jumpToStart.match(action) ? 0 : Math.floor(durationInBeats - offsetInBeats));
			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, newValue + offsetInBeats) }));
		},
	});
	instance.startListening({
		matcher: isAnyOf(seekForwards, seekBackwards),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const durationInBeats = selectDurationInBeats(state, songId);
			if (durationInBeats === null) return;
			const cursorPositionInBeats = selectCursorPositionInBeats(state, songId);
			const offsetInBeats = selectEditorOffsetInBeats(state, songId);

			const { context } = router.state.matches[router.state.matches.length - 1];
			// if we're in the events view, scale the window per the current zoom level
			const windowSize = "view" in context && context.view === View.LIGHTSHOW ? selectEventsEditorBeatsPerZoomLevel(state) : 32;
			// if we're 1/8 beats to the edge of the window, skip to the next one.
			const threshold = Math.ceil(windowSize / 8);

			const progress = cursorPositionInBeats % windowSize;
			const currentWindowStart = cursorPositionInBeats - progress;

			let newStartBeat: number;

			if (seekForwards.match(action)) {
				const offset = progress < windowSize - threshold ? windowSize : 0;
				const anchor = currentWindowStart + offset;
				newStartBeat = anchor > Math.floor(durationInBeats - offsetInBeats) ? Math.floor(durationInBeats - offsetInBeats) : anchor;
			} else {
				const offset = progress < threshold ? windowSize : 0;
				const anchor = currentWindowStart - offset;
				newStartBeat = anchor < 0 ? 0 : anchor;
			}
			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, newStartBeat + offsetInBeats) }));
		},
	});
	instance.startListening({
		actionCreator: scrollThroughSong,
		effect: (action, api) => {
			const { songId, direction } = action.payload;
			// If the song isn't loaded yet, ignore this action. This can happen if the user starts scrolling before the song has loaded.
			if (!audioSample.isBufferLoaded()) return;

			const state = api.getState();
			const cursorPosition = selectCursorPosition(state);
			// We want to jump by the amount that we're snapping to.
			const snapTo = selectSnap(state);
			const incrementInMs = selectTimeForBeat(state, songId, snapTo);
			api.dispatch(updateCursorPosition({ value: direction === "forwards" ? cursorPosition + incrementInMs : cursorPosition - incrementInMs }));
		},
	});
	instance.startListening({
		matcher: isAnyOf(updatePlaybackRate, incrementPlaybackRate, decrementPlaybackRate),
		effect: (_, api) => {
			const state = api.getState();
			const playbackRate = selectPlaybackRate(state);
			audioSample.changePlaybackRate(playbackRate);
		},
	});
	instance.startListening({
		actionCreator: updateSongVolume,
		effect: (action) => {
			const { value: volume } = action.payload;
			audioSample.changeVolume(volume);
		},
	});
	instance.startListening({
		actionCreator: updateTickVolume,
		effect: (action) => {
			const { value: volume } = action.payload;
			tickSample.changeVolume(volume);
		},
	});
	instance.startListening({
		actionCreator: updateTickType,
		effect: (action) => {
			const { value: type } = action.payload;
			tickSample.load(NOTE_TICK_TYPES[type]);
		},
	});

	return instance.middleware;
}
