import { updateGridSize, upsertGridPreset } from "$/store/actions";
import { selectActiveSongId } from "$/store/helpers/route.helpers";
import { selectGridPresetById, selectGridSize } from "$/store/selectors";
import type { AppThunkApiConfig } from "$/store/types";
import { createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";

export const loadGridPreset = createThunk("loadGridPreset", (args: { slot: string }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const songId = selectActiveSongId(api.extra.getRouter());
	const gridFromPreset = selectGridPresetById(api.getState(), args.slot);
	api.dispatch(updateGridSize({ songId, changes: gridFromPreset }));
});
export const saveGridPreset = createThunk("saveGridPreset", (args: { slot: string }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const songId = selectActiveSongId(api.extra.getRouter());
	const state = api.getState();
	const grid = selectGridSize(state, songId);
	api.dispatch(upsertGridPreset({ ...args, grid }));
});
