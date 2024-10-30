import { createListenerMiddleware } from "@reduxjs/toolkit";
import { SAVE } from "redux-storage";

import { saveBeatmap } from "$/services/file.service";
import { createBeatmapContentsFromState } from "$/services/packaging.service";
import { getDifficulty, getSelectedSong } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { autosaveWorker } from "$/workers";

// Saving is a significantly expensive operation, and it's one that is done very often, so it makes sense to do it in a web worker.
const worker = autosaveWorker();

export default function createBackupMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		type: SAVE,
		effect: (_, api) => {
			const state = api.getState();
			// For reasons unknown to me, sometimes while on localhost the instance isn't created properly, and lacks a 'save' method. :/
			// If it fails, we can save the "normal" way. I _think_ this only seems to happen on localhost.
			try {
				worker.save(state);
			} catch (err) {
				const song = getSelectedSong(state);
				const difficulty = getDifficulty(state);
				// We only want to autosave when a song is currently selected
				if (!song || !difficulty) return;
				const beatmapContents = createBeatmapContentsFromState(state, song);
				saveBeatmap(song.id, difficulty, beatmapContents).catch((err) => {
					console.error("Could not run backup for beatmap file", err);
				});
			}
		},
	});

	return instance.middleware;
}
