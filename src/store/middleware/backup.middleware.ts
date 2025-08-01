import { type PayloadAction, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { downloadMapFiles, leaveEditor, saveBeatmapContents } from "$/store/actions";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";
import type { createAutosaveWorker } from "$/workers";

interface Options {
	worker: ReturnType<typeof createAutosaveWorker>;
}
export default function createBackupMiddleware({ worker }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		matcher: isAnyOf(saveBeatmapContents, downloadMapFiles, leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			await worker.save(state, songId);
		},
	});

	return instance.middleware;
}
