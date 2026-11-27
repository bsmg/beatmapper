import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { addSong, addSongFromFile, updateBeatmap, updateNew, updateProcessingImport, updateUsername } from "$/store/actions";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";

interface Options {
	extra: Pick<AppExtraArgs, never>;
}

/** Manages cross-site side effects (since colocating these effects with their respective slices would otherwise cause circular references). */
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
		actionCreator: updateBeatmap,
		effect: (action, api) => {
			if (action.payload.changes.mappers) {
				api.dispatch(updateUsername(action.payload.changes.mappers[0]));
			}
		},
	});

	return instance.middleware;
}
