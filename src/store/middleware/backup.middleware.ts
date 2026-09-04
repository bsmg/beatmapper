import { createAsyncThunk, createListenerMiddleware, type GetThunkAPI, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { addBeatmap, addColorScheme, copyBeatmap, leaveEditor, removeBeatmap, removeColorScheme, updateBeatmap, updateColorScheme, updateCustomColors, updateGridSize, updateModuleEnabled, updateSong } from "$/store/actions";
import { selectActiveBeatmapId, selectActiveSongId } from "$/store/helpers/route.helpers";
import { selectBeatmapEntities, selectBeatmapIds, selectBeatmapIdsWithLightshowId, selectDuration, selectEditorOffsetInBeats, selectLightshowIdForBeatmap, selectSongById } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, AppThunkApiConfig, RootState } from "$/store/types";
import { createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";
import type { App, BeatmapId, SongId } from "$/types";

export const saveMapFiles = createThunk("saveMap", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const songId = selectActiveSongId(api.extra.getRouter());
	const beatmapId = selectActiveBeatmapId(api.extra.getRouter());

	api.dispatch(saveInfoContents({ songId }));
	api.dispatch(saveBeatmapContents({ songId, beatmapId }));
});

export const saveInfoContents = createAsyncThunk("saveInfoContents", async (args: { songId: SongId }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore">>) => {
	const state = api.getState();
	const filestore = api.extra.getFilestore();

	const song = selectSongById(state, args.songId);

	const { ...info } = serializeInfoContents(song, {
		songDuration: selectDuration(state),
	});

	await filestore.updateInfoContents(args.songId, info);
});
export const saveBeatmapContents = createAsyncThunk("saveBeatmapContents", async (args: { songId: SongId; beatmapId: BeatmapId; entities: App.IBeatmapEntities }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore">>) => {
	const state = api.getState();
	const filestore = api.extra.getFilestore();

	const { difficulty, lightshow, customData } = serializeBeatmapContents(args.entities, {
		version: await filestore.loadImplicitVersion(args.songId, args.beatmapId),
		editorOffsetInBeats: selectEditorOffsetInBeats(state, args.songId),
	});

	await filestore.updateBeatmapContents(args.songId, args.beatmapId, { difficulty, lightshow, customData });

	// copy custom data across all beatmaps
	for (const targetBeatmapId of selectBeatmapIds(state, args.songId)) {
		await filestore.updateBeatmapContents(args.songId, targetBeatmapId, { customData });
	}
	// copy lightshow data across beatmaps that share the same lightshow
	for (const targetBeatmapId of selectBeatmapIdsWithLightshowId(state, args.songId, selectLightshowIdForBeatmap(state, args.songId, args.beatmapId))) {
		await filestore.updateBeatmapContents(args.songId, targetBeatmapId, { lightshow });
	}
});

interface Options {
	extra: Pick<AppExtraArgs, "getToaster">;
}

/** Manages autosaving for map contents when specific actions are triggered. */
export default function createBackupMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		matcher: isAnyOf(updateSong, addBeatmap, copyBeatmap, updateBeatmap, removeBeatmap, addColorScheme, updateColorScheme, removeColorScheme, updateModuleEnabled, updateCustomColors, updateGridSize),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			api.dispatch(saveInfoContents(action.payload));
		},
	});
	instance.startListening({
		matcher: isAnyOf(leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId }>, api) => {
			const entities = selectBeatmapEntities(api.getOriginalState());
			api.dispatch(saveBeatmapContents({ ...action.payload, entities }));
		},
	});
	instance.startListening({
		matcher: isAnyOf(saveInfoContents.fulfilled, saveBeatmapContents.fulfilled),
		effect: async (action: PayloadAction<unknown, string, { arg: { songId: SongId; beatmapId?: BeatmapId } }>, api) => {
			const toaster = api.extra.getToaster();
			const id = `${action.meta.arg.beatmapId ? `${action.meta.arg.songId}/${action.meta.arg.beatmapId}` : action.meta.arg.songId}`;
			toaster.success({ id: `save/${action.meta.arg.songId}`, description: `Contents for "${id}" has been saved.` });
		},
	});

	return instance.middleware;
}
