import { createSlice } from "@reduxjs/toolkit";
import type { IBPMTimeScale } from "bsmap";

import { leaveEditor, loadAudioDataContents } from "./actions";

const initialState = {
	timescale: [] as IBPMTimeScale[],
};

const slice = createSlice({
	name: "timeline",
	initialState: initialState,
	selectors: {
		selectTimescale: (state) => state.timescale,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadAudioDataContents.fulfilled, (state, action) => {
			return { ...state, timescale: action.payload.timescale };
		});
		builder.addCase(leaveEditor, () => initialState);
	},
});

export const { selectTimescale } = slice.getSelectors(slice.selectSlice);

export default slice;
