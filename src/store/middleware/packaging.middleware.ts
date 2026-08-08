import { createListenerMiddleware } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";

import { exportMapArchiveFromFilestore } from "$/services/packaging.service";
import { downloadMapFiles } from "$/store/actions";
import { selectSongById } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";

interface Options {
	extra: Pick<AppExtraArgs, "getFilestore" | "getToaster">;
}

export default function createPackagingMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		actionCreator: downloadMapFiles,
		effect: async (action, api) => {
			const { songId, ...options } = action.payload;
			const state = api.getState();
			const song = selectSongById(state, songId);

			try {
				const filestore = api.extra.getFilestore();
				saveAs(await exportMapArchiveFromFilestore(song, filestore, options));
			} catch (error) {
				const toaster = api.extra.getToaster();
				toaster?.error({ description: `Could not export map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	return instance.middleware;
}
