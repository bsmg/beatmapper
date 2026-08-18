import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import type { AudioSample } from "$/services/audio.service";
import { jumpBackwards, jumpForwards, jumpToBeat, jumpToEnd, jumpToStart, jumpToTime, leaveEditor, moveBackwards, moveForwards, pausePlayback, startPlayback, stopPlayback, tick, togglePlayback, updateCursorPosition } from "$/store/actions";
import { selectActiveSongId, selectActiveView } from "$/store/helpers/route.helpers";
import { selectBeatForTime, selectCursorPosition, selectDuration, selectEventsEditorBeatsPerZoomLevel, selectEventsEditorWindowLock, selectPlaying, selectSnap, selectTimeForBeat } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { View } from "$/types";
import { floorToNearest } from "$/utils";

function calculateJumpTargetBeat(currentBeat: number, durationInBeats: number, direction: number, windowSize: number): number {
	if (!Number.isFinite(direction)) {
		return direction < 0 ? 0 : durationInBeats;
	}

	if (direction > 0) {
		const nextBoundary = Math.ceil((currentBeat + 0.0001) / windowSize) * windowSize;
		const target = Math.abs(nextBoundary - currentBeat) < 0.0001 ? currentBeat + windowSize : nextBoundary;
		return Math.min(target, durationInBeats);
	} else {
		const prevBoundary = Math.floor((currentBeat - 0.0001) / windowSize) * windowSize;
		return Math.abs(prevBoundary - currentBeat) < 0.0001 ? currentBeat - windowSize : prevBoundary;
	}
}

interface Options {
	songSample: AudioSample;
	extra: Pick<AppExtraArgs, "getRouter" | "getFilestore" | "getAudioContext">;
}

/** Manages all concerns related to audio playback and timescales. */
export default function createPlaybackMiddleware({ songSample, extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		actionCreator: startPlayback,
		effect: (_, api) => {
			songSample.onTick((currentTime, lastTime) => {
				const state = api.getState();
				const songId = selectActiveSongId(api.extra.getRouter());
				api.dispatch(tick({ cursorPosition: currentTime, lastBeat: selectBeatForTime(state, songId, lastTime), currentBeat: selectBeatForTime(state, songId, currentTime) }));
			});
		},
	});
	instance.startListening({
		actionCreator: tick,
		effect: (action, api) => {
			const { lastBeat, currentBeat } = action.payload;

			const state = api.getState();
			const beatsPerZoomLevel = selectEventsEditorBeatsPerZoomLevel(state);
			const songId = selectActiveSongId(api.extra.getRouter());
			const view = selectActiveView(api.extra.getRouter());

			if (view === View.LIGHTSHOW && selectEventsEditorWindowLock(state)) {
				const currentBeatTime = selectTimeForBeat(state, songId, currentBeat);
				const lastBeatTime = selectTimeForBeat(state, songId, lastBeat);

				const windowForLastBeat = floorToNearest(lastBeat, beatsPerZoomLevel);
				const windowForCurrentBeat = floorToNearest(currentBeat, beatsPerZoomLevel);

				const { baseLatency } = api.extra.getAudioContext();

				if (windowForLastBeat < windowForCurrentBeat && currentBeatTime - lastBeatTime > baseLatency) {
					const commandeeredPosition = selectTimeForBeat(state, songId, windowForLastBeat);
					api.dispatch(updateCursorPosition(commandeeredPosition));
				}
			}
		},
	});

	instance.startListening({
		actionCreator: togglePlayback,
		effect: (_, api) => {
			if (selectPlaying(api.getOriginalState())) {
				api.dispatch(pausePlayback());
			} else {
				api.dispatch(startPlayback());
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(jumpToTime, jumpToBeat),
		effect: (_, api) => {
			if (selectPlaying(api.getOriginalState())) {
				api.dispatch(pausePlayback());
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(leaveEditor),
		effect: (_, api) => {
			if (selectPlaying(api.getOriginalState())) {
				api.dispatch(stopPlayback());
			}
		},
	});

	instance.startListening({
		matcher: isAnyOf(pausePlayback, stopPlayback),
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());
			const targetBeat = Math.round(selectBeatForTime(state, songId, pausePlayback.match(action) ? selectCursorPosition(state) : 0));

			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
		},
	});
	instance.startListening({
		actionCreator: jumpToTime,
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());
			const targetBeat = Math.round(selectBeatForTime(state, songId, action.payload.value));

			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
		},
	});
	instance.startListening({
		actionCreator: jumpToBeat,
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, action.payload.value)));
		},
	});
	instance.startListening({
		matcher: isAnyOf(jumpToStart, jumpToEnd),
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);
			const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));
			const windowSize = Math.round(durationInBeats);

			const targetBeat = calculateJumpTargetBeat(cursorPositionInBeats, durationInBeats, jumpToStart.match(action) ? -Infinity : Infinity, windowSize);
			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
		},
	});
	instance.startListening({
		matcher: isAnyOf(jumpForwards, jumpBackwards),
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());
			const view = selectActiveView(api.extra.getRouter());

			const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);
			const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));
			const windowSize = view === View.LIGHTSHOW ? selectEventsEditorBeatsPerZoomLevel(state) : 32;

			const targetBeat = calculateJumpTargetBeat(cursorPositionInBeats, durationInBeats, jumpForwards.match(action) ? 1 : -1, windowSize);
			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
		},
	});
	instance.startListening({
		matcher: isAnyOf(moveForwards, moveBackwards),
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			const durationInBeats = selectBeatForTime(state, songId, selectDuration(state) ?? 0);
			const cursorPositionInBeats = selectBeatForTime(state, songId, selectCursorPosition(state));
			const snapTo = selectSnap(state);

			const targetBeat = calculateJumpTargetBeat(cursorPositionInBeats, durationInBeats, moveForwards.match(action) ? 1 : -1, snapTo);
			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
		},
	});

	return instance.middleware;
}
