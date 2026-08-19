import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { addSong, addSongFromFile, loadAudioDataContents, updateAllSelectedObstacles, updateBeatmap, updateNew, updateNotesEditorDefaultObstacleDuration, updateObstacle, updateProcessingImport, updateSong, updateUsername } from "$/store/actions";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import type { App } from "$/types";

interface Options {
	extra: Pick<AppExtraArgs, "getRouter">;
}

export default function createSharedMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		matcher: isAnyOf(addSongFromFile.pending, addSongFromFile.settled),
		effect: (action, api) => {
			api.dispatch(updateProcessingImport(addSongFromFile.pending.match(action)));
		},
	});
	instance.startListening({
		matcher: isAnyOf(addSong, addSongFromFile.fulfilled),
		effect: (_, api) => {
			api.dispatch(updateNew(false));
		},
	});
	instance.startListening({
		actionCreator: updateSong,
		effect: (action, api) => {
			if (action.payload.changes.bpm) {
				api.dispatch(loadAudioDataContents({ songId: action.payload.songId, options: { bpm: action.payload.changes.bpm } }));
			}
		},
	});
	instance.startListening({
		actionCreator: updateBeatmap,
		effect: (action, api) => {
			if (action.payload.changes.mappers) {
				api.dispatch(updateUsername(action.payload.changes.mappers[0]));
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateObstacle, updateAllSelectedObstacles),
		effect: (action: PayloadAction<{ changes: Partial<App.IObstacle> }>, api) => {
			if (action.payload.changes.duration) {
				api.dispatch(updateNotesEditorDefaultObstacleDuration(action.payload.changes.duration));
			}
		},
	});

	return instance.middleware;
}
