import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { copySelection, cutSelection } from "$/store/actions";
import { type App, View } from "$/types";

const initialState = {
	view: null as View | null,
	data: {} as Partial<Omit<App.BeatmapEntities, "bookmarks">> | null,
};

const slice = createSlice({
	name: "clipboard",
	initialState: initialState,
	selectors: {
		selectData: (state) => state.data,
		selectHasObjects: (state) => state.data && state.view === View.BEATMAP,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addMatcher(isAnyOf(cutSelection.fulfilled, copySelection.fulfilled), (_, action) => {
			const { view, data } = action.payload;
			if (!data) return;
			return {
				view,
				data: {
					// We want to sort the data so that it goes from earliest beat to latest beat.
					// This is made slightly tricky by the fact that notes have a different data format from obstacles and events :/
					notes: data.notes?.sort(sortObjectFn),
					obstacles: data.obstacles?.sort(sortObjectFn),
					events: data.events?.sort(sortObjectFn),
				},
			};
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
