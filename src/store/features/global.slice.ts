import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { loadSnapshot } from "$/store/actions";

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
		builder.addMatcher(isAnyOf(loadSnapshot), (state) => {
			return { ...state, hasInitialized: true };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
