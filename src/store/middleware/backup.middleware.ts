import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import type { BeatmapFilestore } from "$/services/file.service";
import { downloadMapFiles, leaveEditor, saveBeatmapContents, updateBeatmap, updateSong } from "$/store/actions";
import type { RootState } from "$/store/setup";
import type { App, BeatmapId, SongId } from "$/types";
import type { createAutosaveWorker } from "$/workers";
import { selectActiveBeatmapId } from "../selectors";

interface Options {
	filestore: BeatmapFilestore;
	worker: ReturnType<typeof createAutosaveWorker>;
}
export default function createBackupMiddleware({ worker }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		matcher: isAnyOf(saveBeatmapContents, downloadMapFiles),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const beatmapId = selectActiveBeatmapId(state);
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
