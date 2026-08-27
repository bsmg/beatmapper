import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import type { AudioSample } from "$/services/audio.service";
import { jumpToBeat, jumpToTime, leaveEditor, pausePlayback, startPlayback, stopPlayback, tick, updateCursorPosition } from "$/store/actions";
import { selectActiveSongId, selectActiveView } from "$/store/helpers/route.helpers";
import { selectBeatForTime, selectCursorPosition, selectEventsEditorBeatsPerZoomLevel, selectEventsEditorWindowLock, selectPlaying, selectTimeForBeat } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { View } from "$/types";
import { floorToNearest } from "$/utils";

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
		matcher: isAnyOf(pausePlayback, stopPlayback),
		effect: (action, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());
			const targetBeat = Math.round(selectBeatForTime(state, songId, pausePlayback.match(action) ? selectCursorPosition(state) : 0));

			api.dispatch(updateCursorPosition(selectTimeForBeat(state, songId, targetBeat)));
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

	return instance.middleware;
}
