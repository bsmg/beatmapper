import type { AsyncThunkPayloadCreator, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { type App, View } from "$/types";
import { createSlice } from "../helpers";
import { selectAllSelectedEntities } from "../selectors";
import type { RootState } from "../setup";

const initialState = {
	view: null as View | null,
	data: {} as Partial<Omit<App.IBeatmapEntities, "bookmarks">> | null,
};

const fetchClipboardData: AsyncThunkPayloadCreator<typeof initialState, { view: View }> = (args: { view: View }, api) => {
	const state = api.getState() as RootState;
	const selection = selectAllSelectedEntities(state, args.view);
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
			events: data.events?.sort(sortObjectFn),
		},
	};
};

const slice = createSlice({
	name: "clipboard",
	initialState: initialState,
	selectors: {
		selectData: (state) => state.data,
		selectHasObjects: (state) => state.data && state.view === View.BEATMAP,
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
