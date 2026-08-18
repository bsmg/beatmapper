import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import type { AudioSample } from "$/services/audio.service";
import { jumpToBeat, jumpToEnd, jumpToStart, jumpToTime, pausePlayback, scrollThroughSong, seekBackwards, seekForwards, startPlayback, stopPlayback, tick, togglePlayback, updateCursorPosition } from "$/store/actions";
import { selectActiveView } from "$/store/helpers/route.helpers";
import { selectBeatForTime, selectCursorPosition, selectDuration, selectEventsEditorBeatsPerZoomLevel, selectEventsEditorWindowLock, selectPlaying, selectSnap, selectTimeForBeat } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { type SongId, View } from "$/types";
import { floorToNearest } from "$/utils";

interface Options {
	songSample: AudioSample;
	extra: Pick<AppExtraArgs, "getRouter" | "getFilestore">;
}

/** Manages all concerns related to audio playback and timescales. */
export default function createPlaybackMiddleware({ songSample, extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	let animationFrameId: number;

	instance.startListening({
		actionCreator: togglePlayback,
		effect: (action, api) => {
			if (selectPlaying(api.getOriginalState())) {
				api.dispatch(pausePlayback({ songId: action.payload.songId }));
			} else {
				api.dispatch(startPlayback({ songId: action.payload.songId }));
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(pausePlayback, stopPlayback),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			window.cancelAnimationFrame(animationFrameId);

			const { songId } = action.payload;

			const state = api.getState();
			const targetBeat = Math.round(selectBeatForTime(state, songId, pausePlayback.match(action) ? selectCursorPosition(state) : 0));
			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, targetBeat) }));
		},
	});
	instance.startListening({
		actionCreator: startPlayback,
		effect: (action, api) => {
			const { songId } = action.payload;

			let lastBeat = 0;

			const onTick = () => {
				const state = api.getState();
				const currentTime = songSample.getCurrentTime();
				const currentBeat = selectBeatForTime(state, songId, currentTime);
				const duration = selectDuration(state);

				if (songSample.isPlaying && duration && currentTime > duration) {
					api.dispatch(stopPlayback({ songId }));
					return;
				}

				api.dispatch(tick({ songId, currentTime, lastBeat, currentBeat }));

				lastBeat = currentBeat;
				animationFrameId = window.requestAnimationFrame(onTick);
			};
			animationFrameId = window.requestAnimationFrame(onTick);
		},
	});
	instance.startListening({
		actionCreator: tick,
		effect: (action, api) => {
			const { songId, lastBeat, currentBeat } = action.payload;

			const state = api.getState();

			const view = selectActiveView(api.extra.getRouter());

			if (view === View.LIGHTSHOW) {
				const beatsPerZoomLevel = selectEventsEditorBeatsPerZoomLevel(state);

				const currentTime = selectTimeForBeat(state, songId, currentBeat);
				const lastBeatTime = selectTimeForBeat(state, songId, lastBeat);
				const windowForCurrentBeat = floorToNearest(currentBeat, beatsPerZoomLevel);
				const windowForLastBeat = floorToNearest(lastBeat, beatsPerZoomLevel);

				const justExceededWindow = windowForLastBeat < windowForCurrentBeat && currentTime - lastBeatTime < 100;

				if (selectEventsEditorWindowLock(state) && justExceededWindow) {
					const commandeeredPosition = selectTimeForBeat(state, songId, windowForLastBeat);
					api.dispatch(updateCursorPosition({ value: commandeeredPosition }));
				}
			}
		},
	});
	instance.startListening({
		actionCreator: jumpToTime,
		effect: (action, api) => {
			const { songId, value, pauseTrack } = action.payload;

			const state = api.getState();

			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, Math.round(selectBeatForTime(state, songId, value))) }));
			if (pauseTrack) {
				api.dispatch(pausePlayback({ songId }));
			}
		},
	});
	instance.startListening({
		actionCreator: jumpToBeat,
		effect: (action, api) => {
			const { songId, value, pauseTrack } = action.payload;

			const state = api.getState();

			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, value) }));
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
			const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);
			const targetBeat = jumpToStart.match(action) ? 0 : Math.floor(durationInBeats);

			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, targetBeat) }));
		},
	});
	instance.startListening({
		matcher: isAnyOf(seekForwards, seekBackwards),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;

			const state = api.getState();
			const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);
			const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));

			const view = selectActiveView(api.extra.getRouter());

			const windowSize = view === View.LIGHTSHOW ? selectEventsEditorBeatsPerZoomLevel(state) : 32;
			const threshold = Math.ceil(windowSize / 8);
			const progress = cursorPositionInBeats % windowSize;
			const currentWindowStart = cursorPositionInBeats - progress;

			let newStartBeat: number;

			if (seekForwards.match(action)) {
				const offset = progress < windowSize - threshold ? windowSize : 0;
				const anchor = currentWindowStart + offset;
				newStartBeat = anchor > Math.floor(durationInBeats ?? 0) ? Math.floor(durationInBeats ?? 0) : anchor;
			} else {
				const offset = progress < threshold ? windowSize : 0;
				const anchor = currentWindowStart - offset;
				newStartBeat = anchor < 0 ? 0 : anchor;
			}

			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, newStartBeat) }));
		},
	});
	instance.startListening({
		actionCreator: scrollThroughSong,
		effect: (action, api) => {
			if (!songSample.isBufferLoaded()) {
				return;
			}
			const { songId, direction } = action.payload;

			const state = api.getState();
			const snapTo = selectSnap(state) * (direction === "forwards" ? 1 : -1);
			const currentBeat = selectBeatForTime(state, songId, selectCursorPosition(state));

			api.dispatch(updateCursorPosition({ value: selectTimeForBeat(state, songId, currentBeat + snapTo) }));
		},
	});

	return instance.middleware;
}
