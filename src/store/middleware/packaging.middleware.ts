import { createListenerMiddleware } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";

import { exportMapArchiveFromFilestore } from "$/services/packaging.service";
import { getAppToaster } from "$/setup";
import { downloadMapFiles } from "$/store/actions";
import { selectSongById } from "$/store/selectors";
import type { AppDispatch, RootState } from "$/store/setup";

export default function createPackagingMiddleware() {
	const instance = createListenerMiddleware<RootState, AppDispatch>();

	const toaster = getAppToaster();

	instance.startListening({
		actionCreator: downloadMapFiles,
		effect: async (action, api) => {
			const { songId, ...options } = action.payload;
			const state = api.getState();
			const song = selectSongById(state, songId);

			try {
				saveAs(await exportMapArchiveFromFilestore(song, options));
			} catch (error) {
				toaster?.error({ description: `Could not export map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	return instance.middleware;
}
