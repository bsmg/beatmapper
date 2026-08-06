import { createSlice } from "@reduxjs/toolkit";
import type { IBPMTimeScale } from "bsmap";

import { leaveEditor } from "$/store/actions";

const initialState = {
	timescale: [] as IBPMTimeScale[],
};

const slice = createSlice({
	name: "timeline",
	initialState: initialState,
	selectors: {
		selectTimescale: (state) => state.timescale,
	},
	reducers: (api) => {
		return {
			updateTimescale: api.reducer<{ timescale: IBPMTimeScale[] }>((state, action) => {
				return { ...state, timescale: action.payload.timescale };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(leaveEditor, (state) => {
			return { ...state, timescale: [] };
		});
	},
});

export default slice;
