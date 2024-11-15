import { createListenerMiddleware } from "@reduxjs/toolkit";

import { convertEventsToExportableJson } from "$/helpers/events.helpers";
import type { BeatmapFilestore } from "$/services/file.service";
import { createBeatmapContentsFromState, createInfoContent, zipFiles } from "$/services/packaging.service";
import { shiftEntitiesByOffset } from "$/services/packaging.service.nitty-gritty";
import { downloadMapFiles } from "$/store/actions";
import { getAllEventsAsArray, getDifficulty, getSelectedSong, getSelectedSongDifficultyIds, getSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";

function saveEventsToAllDifficulties(state: RootState, filestore: BeatmapFilestore) {
	const song = getSelectedSong(state);
	const difficulties = getSelectedSongDifficultyIds(state);

	const events = convertEventsToExportableJson(getAllEventsAsArray(state));
	const shiftedEvents = shiftEntitiesByOffset(events, song.offset, song.bpm);

	return Promise.all(
		difficulties.map(async (difficulty) => {
			const fileContents = await filestore.loadBeatmapFile(song.id, difficulty);
			if (!fileContents) throw new Error(`No beatmap file for ${song.id}/${difficulty}.`);
			fileContents._events = shiftedEvents;
			return filestore.saveBeatmapFile(song.id, difficulty, fileContents);
		}),
	);
}

interface Options {
	filestore: BeatmapFilestore;
}
export default function createPackagingMiddleware({ filestore }: Options) {
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
				await filestore.saveInfoFile(song.id, infoContent);
				if (difficulty) await filestore.saveBeatmapFile(song.id, difficulty, beatmapContent);
				// We also want to share events between all difficulties.
				// Copy the events currently in state to the non-loaded beatmaps.
				await saveEventsToAllDifficulties(state, filestore);
			}
			// Next, I need to fetch all relevant files from disk.
			// TODO: Parallelize this if it takes too long
			const songFile = await filestore.loadFile<Blob>(song.songFilename);
			const coverArtFile = await filestore.loadFile<Blob>(song.coverArtFilename);
			if (!songFile || !coverArtFile) return;
			await zipFiles(song, songFile, coverArtFile, version);
		},
	});

	return instance.middleware;
}
