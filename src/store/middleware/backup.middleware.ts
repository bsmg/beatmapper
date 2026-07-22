import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { createSaveHandler } from "$/services/backup.service";
import { leaveEditor, saveBeatmapContents, updateBeatmap, updateSong } from "$/store/actions";
import { selectSelectedBeatmap } from "$/store/selectors";
import type { AppDispatch, RootState } from "$/store/setup";
import type { App, BeatmapId, SongId } from "$/types";

export default function createBackupMiddleware() {
	const instance = createListenerMiddleware<RootState, AppDispatch>();

	const save = createSaveHandler();

	instance.startListening({
		matcher: isAnyOf(saveBeatmapContents),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			const beatmapId = selectSelectedBeatmap(state, songId);
			await save(state, songId, beatmapId);
		},
	});
	instance.startListening({
		matcher: isAnyOf(leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId; entities: Partial<App.IBeatmapEntities> }>, api) => {
			const { songId, beatmapId, entities } = action.payload;
			const state = api.getState();
			await save(state, songId, beatmapId, entities);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateSong),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			await save(state, songId, null);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateBeatmap),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId }>, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();
			await save(state, songId, beatmapId);
		},
	});

	return instance.middleware;
}
