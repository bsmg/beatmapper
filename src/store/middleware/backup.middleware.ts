import { type PayloadAction, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import type { BeatmapFilestore } from "$/services/file.service";
import { createBeatmapContentsFromState } from "$/services/packaging.service";
import { downloadMapFiles, finishLoadingSong, leaveEditor } from "$/store/actions";
import { selectActiveBeatmapId, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";
import type { createAutosaveWorker } from "$/workers";

interface Options {
	filestore: BeatmapFilestore;
	worker: ReturnType<typeof createAutosaveWorker>;
}
export default function createBackupMiddleware({ filestore, worker }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		matcher: isAnyOf(finishLoadingSong, downloadMapFiles, leaveEditor),
		effect: (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const state = api.getState();
			// For reasons unknown to me, sometimes while on localhost the instance isn't created properly, and lacks a 'save' method. :/
			// If it fails, we can save the "normal" way. I _think_ this only seems to happen on localhost.
			try {
				worker.save(state, songId);
			} catch (err) {
				const song = selectSongById(state, songId);
				const difficulty = selectActiveBeatmapId(state);
				// We only want to autosave when a song is currently selected
				if (!song || !difficulty) return;
				const beatmapContents = createBeatmapContentsFromState(state, song);
				filestore.saveBeatmapFile(song.id, difficulty, beatmapContents).catch((err) => {
					console.error("Could not run backup for beatmap file", err);
				});
			}
		},
	});

	return instance.middleware;
}
