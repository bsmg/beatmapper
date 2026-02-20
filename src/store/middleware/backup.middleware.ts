import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { downloadMapFiles, leaveEditor, saveBeatmapContents, updateBeatmap, updateSong } from "$/store/actions";
import { selectSelectedBeatmap } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, BeatmapId, SongId } from "$/types";
import { createAutosaveWorker } from "$/workers";

export default function createBackupMiddleware() {
	const instance = createListenerMiddleware<RootState>();
	const worker = createAutosaveWorker();

	instance.startListening({
		matcher: isAnyOf(saveBeatmapContents, downloadMapFiles),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const beatmapId = selectSelectedBeatmap(state, songId);
			await worker.save(state, songId, beatmapId);
		},
	});
	instance.startListening({
		matcher: isAnyOf(leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId; entities: Partial<App.IBeatmapEntities> }>, api) => {
			const { songId, beatmapId, entities } = action.payload;
			const state = api.getState();
			await worker.save(state, songId, beatmapId, entities);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateSong),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			await worker.save(state, songId, null);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateBeatmap),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId }>, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();
			await worker.save(state, songId, beatmapId);
		},
	});

	return instance.middleware;
}
