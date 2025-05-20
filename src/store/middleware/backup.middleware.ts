import { type PayloadAction, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { changeSelectedDifficulty, downloadMapFiles, leaveEditor } from "$/store/actions";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";
import type { createAutosaveWorker } from "$/workers";

interface Options {
	worker: ReturnType<typeof createAutosaveWorker>;
}
export default function createBackupMiddleware({ worker }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		matcher: isAnyOf(downloadMapFiles, changeSelectedDifficulty, leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			// For reasons unknown to me, sometimes while on localhost the instance isn't created properly, and lacks a 'save' method. :/
			// If it fails, we can save the "normal" way. I _think_ this only seems to happen on localhost.
			await worker.save(state, songId);
		},
	});

	return instance.middleware;
}
