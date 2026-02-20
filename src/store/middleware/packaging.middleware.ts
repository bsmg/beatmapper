import { createListenerMiddleware } from "@reduxjs/toolkit";

import { zipFiles } from "$/services/packaging.service";
import { getAppBeatmapFilestore, getAppToaster } from "$/setup";
import { downloadMapFiles } from "$/store/actions";
import { selectBeatmaps } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { deepAssign } from "$/utils";

export default function createPackagingMiddleware() {
	const instance = createListenerMiddleware<RootState>();
	const filestore = getAppBeatmapFilestore();
	const toaster = getAppToaster();

	instance.startListening({
		actionCreator: downloadMapFiles,
		effect: async (action, api) => {
			const { songId, version, options } = action.payload;
			const state = api.getState();
			const beatmapsById = selectBeatmaps(state, songId);

			// Next, I need to fetch all relevant files from disk.
			const [songFile, coverArtFile] = await Promise.all([await filestore.loadSongFile(songId), await filestore.loadCoverArtFile(songId)]);

			const defaultOptions: typeof options = {
				optimize: { purgeZeros: version === 2 ? false : options?.optimize?.purgeZeros },
			};

			try {
				await zipFiles({
					version: version ?? null,
					contents: {
						songId: songId,
						beatmapsById: beatmapsById,
						songFile,
						coverArtFile,
					},
					options: deepAssign(defaultOptions, options as typeof defaultOptions),
				});
			} catch (error) {
				toaster?.error({ description: `Could not export map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	return instance.middleware;
}
