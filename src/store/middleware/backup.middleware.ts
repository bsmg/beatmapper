import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { downloadMapFiles, leaveEditor, saveBeatmapContents, updateBeatmap, updateSong } from "$/store/actions";
import type { RootState } from "$/store/setup";
import type { BeatmapId, SongId } from "$/types";
import type { createAutosaveWorker } from "$/workers";
import { selectActiveBeatmapId } from "../selectors";

interface Options {
	worker: ReturnType<typeof createAutosaveWorker>;
}
export default function createBackupMiddleware({ worker }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		matcher: isAnyOf(saveBeatmapContents),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const beatmapId = selectActiveBeatmapId(state);
			await worker.save(state, songId, beatmapId);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateSong, downloadMapFiles),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			await worker.save(state, songId, null);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateBeatmap, leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId }>, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();
			await worker.save(state, songId, beatmapId);
		},
	});

	return instance.middleware;
}
