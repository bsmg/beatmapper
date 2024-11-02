import { createListenerMiddleware } from "@reduxjs/toolkit";

import { getFile, saveBeatmap, saveInfoDat } from "$/services/file.service";
import { createBeatmapContentsFromState, createInfoContent, saveEventsToAllDifficulties, zipFiles } from "$/services/packaging.service";
import { downloadMapFiles } from "$/store/actions";
import { getDifficulty, getSelectedSong, getSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";

export default function createPackagingMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: downloadMapFiles,
		effect: async (action, api) => {
			const { version, songId } = action.payload;
			const state = api.getState();
			const selectedSong = getSelectedSong(state);
			let song = selectedSong;
			if (!selectedSong) {
				if (!songId) throw new Error("Tried to download a song with no supplied songId, and no currently-selected song.");
				song = getSongById(state, songId);
			}
			const infoContent = createInfoContent(song, { version: 2 });
			const beatmapContent = createBeatmapContentsFromState(state, song);
			// If we have an actively-loaded song, we want to first persist that song so that we download the very latest stuff.
			// Note that we can also download files from the homescreen, so there will be no selected difficulty in this case.
			if (selectedSong) {
				const difficulty = getDifficulty(state);
				// Persist the Info.dat and the currently-edited difficulty.
				await saveInfoDat(song.id, infoContent);
				if (difficulty) await saveBeatmap(song.id, difficulty, beatmapContent);
				// We also want to share events between all difficulties.
				// Copy the events currently in state to the non-loaded beatmaps.
				await saveEventsToAllDifficulties(state);
			}
			// Next, I need to fetch all relevant files from disk.
			// TODO: Parallelize this if it takes too long
			const songFile = await getFile<Blob>(song.songFilename);
			const coverArtFile = await getFile<Blob>(song.coverArtFilename);
			if (!songFile || !coverArtFile) return;
			await zipFiles(song, songFile, coverArtFile, version);
		},
	});

	return instance.middleware;
}
