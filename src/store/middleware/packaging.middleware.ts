import { createListenerMiddleware } from "@reduxjs/toolkit";

import type { BeatmapFilestore } from "$/services/file.service";
import { zipFiles } from "$/services/packaging.service";
import { downloadMapFiles } from "$/store/actions";
import { selectBeatmaps } from "$/store/selectors";
import type { RootState } from "$/store/setup";

interface Options {
	filestore: BeatmapFilestore;
}
export default function createPackagingMiddleware({ filestore }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: downloadMapFiles,
		effect: async (action, api) => {
			const { songId, version, options } = action.payload;
			const state = api.getState();
			const beatmapsById = selectBeatmaps(state, songId);

			// Next, I need to fetch all relevant files from disk.
			const [songFile, coverArtFile] = await Promise.all([await filestore.loadSongFile(songId), await filestore.loadCoverArtFile(songId)]);

			await zipFiles(filestore, {
				version: version ?? null,
				contents: {
					songId: songId,
					beatmapsById: beatmapsById,
					songFile,
					coverArtFile,
				},
				options,
			});
		},
	});

	return instance.middleware;
}
