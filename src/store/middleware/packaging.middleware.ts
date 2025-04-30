import { createListenerMiddleware } from "@reduxjs/toolkit";

import { convertEventsToExportableJson } from "$/helpers/events.helpers";
import { serializeInfoContents } from "$/helpers/packaging.helpers";
import type { BeatmapFilestore } from "$/services/file.service";
import { serializeBeatmapContentsFromState, zipFiles } from "$/services/packaging.service";
import { shiftEntitiesByOffset } from "$/services/packaging.service.nitty-gritty";
import { downloadMapFiles } from "$/store/actions";
import { selectActiveBeatmapId, selectAllBasicEvents, selectBeatmapIds, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";

function saveEventsToAllDifficulties(state: RootState, songId: SongId, filestore: BeatmapFilestore) {
	const song = selectSongById(state, songId);
	const difficulties = selectBeatmapIds(state, songId);

	const events = convertEventsToExportableJson(selectAllBasicEvents(state));
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
			const { songId, version } = action.payload;
			if (!songId) throw new Error("No selected song.");
			const state = api.getState();
			const selectedSong = selectSongById(state, songId);
			let song = selectedSong;
			if (!selectedSong) {
				if (!songId) throw new Error("Tried to download a song with no supplied songId, and no currently-selected song.");
				song = selectSongById(state, songId);
			}
			const infoContent = serializeInfoContents(2, song, {});
			const { difficulty: beatmapContent } = serializeBeatmapContentsFromState(2, state, songId);
			// If we have an actively-loaded song, we want to first persist that song so that we download the very latest stuff.
			// Note that we can also download files from the homescreen, so there will be no selected difficulty in this case.
			if (selectedSong) {
				const difficulty = selectActiveBeatmapId(state);
				// Persist the Info.dat and the currently-edited difficulty.
				await filestore.saveInfoFile(song.id, infoContent);
				if (difficulty) await filestore.saveBeatmapFile(song.id, difficulty, beatmapContent);
				// We also want to share events between all difficulties.
				// Copy the events currently in state to the non-loaded beatmaps.
				await saveEventsToAllDifficulties(state, songId, filestore);
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
