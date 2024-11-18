import { createSlice } from "@reduxjs/toolkit";

import { init } from "$/store/actions";

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
		builder.addCase(init, (state) => {
			return { ...state, hasInitialized: true };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
