import { createAsyncThunk, createListenerMiddleware, type GetThunkAPI } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";

import { type ExportMapArchiveOptions, exportMapArchiveFromFilestore } from "$/services/packaging.service";
import { addSongFromFile } from "$/store/actions";
import { selectSongById } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, AppThunkApiConfig, RootState } from "$/store/types";
import type { SongId } from "$/types";

export const downloadMapFiles = createAsyncThunk("downloadMap", async (args: { songId: SongId; options: ExportMapArchiveOptions }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore">>) => {
	const song = selectSongById(api.getState(), args.songId);
	const filestore = api.extra.getFilestore();
	const file = await exportMapArchiveFromFilestore(song, filestore, args.options);
	saveAs(file);
});

interface Options {
	extra: Pick<AppExtraArgs, "getToaster">;
}

/** Manages side effects related to importing and exporting of map contents. */
export default function createPackagingMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		actionCreator: addSongFromFile.rejected,
		effect: (action, api) => {
			console.error(action.error);
			const toaster = api.extra.getToaster();
			toaster.error({ description: `Could not import map: ${action.error.message ?? "See console for more info."}` });
		},
	});
	instance.startListening({
		actionCreator: downloadMapFiles.rejected,
		effect: (action, api) => {
			console.error(action.error);
			const toaster = api.extra.getToaster();
			toaster.error({ description: `Could not export map: ${action.error.message ?? "See console for more info."}` });
		},
	});

	return instance.middleware;
}
