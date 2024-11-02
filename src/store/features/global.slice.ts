import { createSlice } from "@reduxjs/toolkit";
import { LOAD } from "redux-storage";

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
		builder.addCase(LOAD, (state) => {
			return { ...state, hasInitialized: true };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
