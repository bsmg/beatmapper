import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { getBeatNumForItem } from "$/helpers/item.helpers";
import { copySelection, cutSelection } from "$/store/actions";
import { View } from "$/types";

const initialState = {
	view: null as View | null,
	data: null as Array<object> | null,
};

const slice = createSlice({
	name: "clipboard",
	initialState: initialState,
	selectors: {
		getCopiedData: (state) => state.data,
		getHasCopiedNotes: (state) => state.data && state.view === View.BEATMAP,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addMatcher(isAnyOf(cutSelection.fulfilled, copySelection.fulfilled), (_, action) => {
			const { view, data } = action.payload;
			if (!data) return;
			// We want to sort the data so that it goes from earliest beat to latest beat.
			// This is made slightly tricky by the fact that notes have a different data format from obstacles and events :/
			const sortedData = [...data].sort((a, b) => {
				const aBeatNum = getBeatNumForItem(a);
				const bBeatNum = getBeatNumForItem(b);
				return aBeatNum - bBeatNum;
			});
			return {
				view,
				data: sortedData,
			};
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
