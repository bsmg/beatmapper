import { createAsyncThunk, createListenerMiddleware, type GetThunkAPI, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";

import { type ExportMapArchiveOptions, exportMapArchiveFromFilestore } from "$/services/packaging.service";
import { addSongFromFile, downloadMapFiles } from "$/store/actions";
import { selectSongById } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, AppThunkApiConfig, RootState } from "$/store/types";
import type { SongId } from "$/types";

const exportMapContents = createAsyncThunk("exportMap", async (args: { songId: SongId; options: ExportMapArchiveOptions }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore">>) => {
	const song = selectSongById(api.getState(), args.songId);
	const filestore = api.extra.getFilestore();
	const file = await exportMapArchiveFromFilestore(song, filestore, args.options);
	saveAs(file);
});

interface Options {
	extra: Pick<AppExtraArgs, "getToaster">;
}

export default function createPackagingMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		matcher: isAnyOf(downloadMapFiles),
		effect: (action: PayloadAction<{ songId: SongId; options: ExportMapArchiveOptions }>, api) => {
			api.dispatch(exportMapContents(action.payload));
		},
	});
	instance.startListening({
		actionCreator: addSongFromFile.rejected,
		effect: (action, api) => {
			console.error(action.error);
			const toaster = api.extra.getToaster();
			toaster.error({ description: `Could not import map: ${action.error ?? "See console for more info."}` });
		},
	});
	instance.startListening({
		actionCreator: exportMapContents.rejected,
		effect: (action, api) => {
			console.error(action.error);
			const toaster = api.extra.getToaster();
			toaster.error({ description: `Could not export map: ${action.error ?? "See console for more info."}` });
		},
	});

	return instance.middleware;
}
