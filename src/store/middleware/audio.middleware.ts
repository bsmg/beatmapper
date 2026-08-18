import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { NOTE_TICK_TYPES } from "$/constants";
import type { AudioSample } from "$/services/audio.service";
import {
	decrementPlaybackRate,
	decrementSongVolume,
	decrementTickVolume,
	incrementPlaybackRate,
	incrementSongVolume,
	incrementTickVolume,
	loadSongFile,
	pausePlayback,
	startPlayback,
	stopPlayback,
	tick,
	updateCursorPosition,
	updatePlaybackRate,
	updateSongVolume,
	updateTickType,
	updateTickVolume,
} from "$/store/actions";
import { selectActiveSongId, selectActiveView } from "$/store/helpers/route.helpers";
import { selectAllColorNotes, selectPlaybackRate, selectSongVolume, selectTickVolume, selectTimeProcessor } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { View } from "$/types";

interface Options {
	songSample: AudioSample;
	tickSample: AudioSample;
	extra: Pick<AppExtraArgs, "getRouter" | "getFilestore" | "getAudioContext">;
}

/** Manages all concerns related to audio samples. */
export default function createAudioMiddleware({ songSample, tickSample, extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	let tickSchedule: number[] = [];

	instance.startListening({
		actionCreator: loadSongFile.pending,
		effect: async (action, api) => {
			const filestore = api.extra.getFilestore();
			const songFile = await filestore.loadSongFile(action.meta.arg.songId);
			songSample.loadFromFile(songFile);
		},
	});
	instance.startListening({
		actionCreator: updateCursorPosition,
		effect: (action) => {
			songSample.setCurrentTime(action.payload);
		},
	});
	instance.startListening({
		actionCreator: startPlayback,
		effect: () => {
			songSample.play();
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
		matcher: isAnyOf(updateSongVolume, incrementSongVolume, decrementSongVolume),
		effect: (_, api) => {
			songSample.changeVolume(selectSongVolume(api.getState()));
		},
	});

	instance.startListening({
		actionCreator: startPlayback,
		effect: (_, api) => {
			const state = api.getState();
			const notes = selectAllColorNotes(state);
			const songId = selectActiveSongId(api.extra.getRouter());
			const timeProcessor = selectTimeProcessor(state, songId);
			const { baseLatency } = api.extra.getAudioContext();
			const delayInBeats = timeProcessor.toBeatTime(baseLatency);

			tickSchedule = notes.map((note) => note.time - delayInBeats).sort((a, b) => a - b);
		},
	});
	instance.startListening({
		actionCreator: tick,
		effect: (action, api) => {
			const view = selectActiveView(api.extra.getRouter());
			const areNotesVisible = view === View.PREVIEW || view === View.BEATMAP;
			const isTickAudible = selectTickVolume(api.getState()) > 0;
			const shouldTick = tickSchedule.some((t) => t >= action.payload.lastBeat && t < action.payload.currentBeat);

			if (isTickAudible && areNotesVisible && shouldTick) {
				tickSample.trigger();
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateTickVolume, incrementTickVolume, decrementTickVolume),
		effect: (_, api) => {
			tickSample.changeVolume(selectTickVolume(api.getState()));
		},
	});
	instance.startListening({
		actionCreator: updateTickType,
		effect: (action) => {
			tickSample.load(NOTE_TICK_TYPES[action.payload]);
		},
	});

	return instance.middleware;
}
