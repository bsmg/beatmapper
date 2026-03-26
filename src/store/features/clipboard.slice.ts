import type { AsyncThunkPayloadCreator, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { createSlice } from "$/store/helpers";
import { selectSelectedBeatmapEntities } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, View } from "$/types";

const initialState = {
	view: null as View | null,
	data: {} as Partial<Omit<App.IBeatmapEntities, "bookmarks">>,
};

const fetchClipboardData: AsyncThunkPayloadCreator<typeof initialState, { view: View }> = (args: { view: View }, api) => {
	const state = api.getState() as RootState;
	const selection = selectSelectedBeatmapEntities(state, args.view);
	return api.fulfillWithValue({ ...args, data: selection });
};

const processSelection: CaseReducer<typeof initialState, PayloadAction<typeof initialState>> = (state, action) => {
	const { data } = action.payload;
	if (!data) return state;
	return {
		...state,
		data: {
			// We want to sort the data so that it goes from earliest beat to latest beat.
			notes: data.notes?.sort(sortObjectFn),
			bombs: data.bombs?.sort(sortObjectFn),
			obstacles: data.obstacles?.sort(sortObjectFn),
			basicEvents: data.basicEvents?.sort(sortObjectFn),
			boostEvents: data.boostEvents?.sort(sortObjectFn),
		},
	};
};

const slice = createSlice({
	name: "clipboard",
	initialState: initialState,
	selectors: {
		selectData: (state) => state.data,
		selectHasObjects: (state) => {
			if (state.data.notes) return state.data.notes.length > 0;
			if (state.data.bombs) return state.data.bombs.length > 0;
			if (state.data.obstacles) return state.data.obstacles.length > 0;
		},
		selectHasEvents: (state) => {
			if (state.data.basicEvents) return state.data.basicEvents.length > 0;
			if (state.data.boostEvents) return state.data.boostEvents.length > 0;
		},
		selectEarliestBeat: (state) => {
			return [...(state.data.notes ?? []), ...(state.data.bombs ?? []), ...(state.data.obstacles ?? []), ...(state.data.basicEvents ?? []), ...(state.data.boostEvents ?? [])].sort(sortObjectFn)[0].time;
		},
	},
	reducers: (api) => {
		return {
			cutSelection: api.asyncThunk(fetchClipboardData, {
				fulfilled: processSelection,
			}),
			copySelection: api.asyncThunk(fetchClipboardData, {
				fulfilled: processSelection,
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
