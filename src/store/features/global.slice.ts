import { createSlice } from "@reduxjs/toolkit";

import { finishInitializing } from "$/store/actions";

const initialState = {
	hasInitialized: false,
};

const slice = createSlice({
	name: "global",
	initialState: initialState,
	selectors: {
		getHasInitialized: (state) => state.hasInitialized,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(finishInitializing, (state) => {
			return { ...state, hasInitialized: true };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
