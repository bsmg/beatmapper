import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { NOTE_TICK_TYPES } from "$/constants";
import { convertFileToArrayBuffer } from "$/helpers/file.helpers";
import { getRouter, selectActiveView } from "$/router";
import type { AudioSample } from "$/services/audio.service";
import { getAppBeatmapFilestore } from "$/setup";
import { decrementPlaybackRate, finishLoadingMap, incrementPlaybackRate, pausePlayback, startPlayback, stopPlayback, tick, updateCursorPosition, updatePlaybackRate, updateSong, updateSongVolume, updateTickType, updateTickVolume } from "$/store/actions";
import { selectAllColorNotes, selectAudioLatencyInBeats, selectCursorPosition, selectPlaybackRate, selectSongVolume, selectTickVolume } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/setup";
import { type SongId, View } from "$/types";

function getTickSchedule(state: RootState, songId: SongId): number[] {
	const notes = selectAllColorNotes(state);
	const delayInBeats = selectAudioLatencyInBeats(state, songId);
	return notes.map((note) => note.time - delayInBeats).sort((a, b) => a - b);
}

/** Manages all concerns related to audio samples. */
export default function createAudioMiddleware({ songSample, tickSample }: { songSample: AudioSample; tickSample: AudioSample }) {
	const instance = createListenerMiddleware<RootState, AppDispatch, AppExtraArgs>({
		extra: { getRouter },
	});

	const filestore = getAppBeatmapFilestore();

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
				const view = selectActiveView(api.extra.getRouter());

				if (view === View.PREVIEW || view === View.BEATMAP) {
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
		matcher: isAnyOf(updateSongVolume),
		effect: (_, api) => {
			songSample.changeVolume(selectSongVolume(api.getState()));
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateTickVolume),
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
