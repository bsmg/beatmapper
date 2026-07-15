import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { NOTE_TICK_TYPES } from "$/constants";
import { convertFileToArrayBuffer } from "$/helpers/file.helpers";
import { getRouter } from "$/router";
import type { AudioSample } from "$/services/audio.service";
import { getAppBeatmapFilestore } from "$/setup";
import { decrementPlaybackRate, finishLoadingMap, incrementPlaybackRate, pausePlayback, startPlayback, stopPlayback, tick, updateCursorPosition, updatePlaybackRate, updateSong, updateSongVolume, updateTickType, updateTickVolume } from "$/store/actions";
import { selectAllColorNotes, selectAudioProcessingDelayInBeats, selectCursorPosition, selectPlaybackRate, selectTickVolume } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type SongId, View } from "$/types";

function getTickSchedule(state: RootState, songId: SongId): number[] {
	const notes = selectAllColorNotes(state);
	const delayInBeats = selectAudioProcessingDelayInBeats(state, songId);
	return notes.map((note) => note.time - delayInBeats).sort((a, b) => a - b);
}

/** Manages all concerns related to audio samples. */
export default function createAudioMiddleware({ songSample, tickSample }: { songSample: AudioSample; tickSample: AudioSample }) {
	const instance = createListenerMiddleware<RootState>();

	const filestore = getAppBeatmapFilestore();
	const router = getRouter();

	tickSample.load(NOTE_TICK_TYPES[0]);

	let tickSchedule: number[] = [];

	instance.startListening({
		actionCreator: updateCursorPosition,
		effect: async (action) => {
			songSample.setCurrentTime(action.payload.value);
		},
	});
	instance.startListening({
		matcher: isAnyOf(finishLoadingMap, updateSong),
		effect: async (action: PayloadAction<{ songId: SongId; songFile?: File }>, _) => {
			const { songId, songFile } = action.payload;

			if (finishLoadingMap.match(action) || songFile) {
				const updatedSongFile = songFile ?? (await filestore.loadSongFile(songId));
				const arrayBuffer = await convertFileToArrayBuffer(updatedSongFile);
				await songSample.loadFromArrayBuffer(arrayBuffer);
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(finishLoadingMap, startPlayback),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			tickSchedule = getTickSchedule(api.getState(), action.payload.songId);
		},
	});
	instance.startListening({
		actionCreator: tick,
		effect: (action, api) => {
			const { lastBeat, currentBeat } = action.payload;

			if (selectTickVolume(api.getState()) > 0) {
				const { context } = router.state.matches[router.state.matches.length - 1];

				if ("view" in context && (context.view === View.PREVIEW || context.view === View.BEATMAP)) {
					if (tickSchedule.some((t) => t >= lastBeat && t < currentBeat)) {
						tickSample.trigger();
					}
				}
			}
		},
	});
	instance.startListening({
		actionCreator: startPlayback,
		effect: (_, api) => {
			songSample.play(selectCursorPosition(api.getState()));
		},
	});
	instance.startListening({
		matcher: isAnyOf(pausePlayback, stopPlayback),
		effect: () => {
			songSample.pause();
		},
	});
	instance.startListening({
		matcher: isAnyOf(updatePlaybackRate, incrementPlaybackRate, decrementPlaybackRate),
		effect: (_, api) => {
			songSample.changePlaybackRate(selectPlaybackRate(api.getState()));
		},
	});
	instance.startListening({
		actionCreator: updateSongVolume,
		effect: (action) => {
			songSample.changeVolume(action.payload.value);
		},
	});
	instance.startListening({
		actionCreator: updateTickVolume,
		effect: (action) => {
			tickSample.changeVolume(action.payload.value);
		},
	});
	instance.startListening({
		actionCreator: updateTickType,
		effect: (action) => {
			tickSample.load(NOTE_TICK_TYPES[action.payload.value]);
		},
	});

	return instance.middleware;
}
