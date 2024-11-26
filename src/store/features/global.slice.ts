import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { cancelImportingSong, finishLoadingSong, importExistingSong, init, reloadWaveform, startImportingSong, startLoadingSong } from "$/store/actions";

const initialState = {
	initialized: false,
	isLoading: false,
	isProcessingImport: false,
};

const slice = createSlice({
	name: "global",
	initialState: initialState,
	selectors: {
		selectInitialized: (state) => state.initialized,
		selectIsLoading: (state) => state.isLoading,
		selectIsProcessingImport: (state) => state.isProcessingImport,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(init, (state) => {
			return { ...state, initialized: true };
		});
		builder.addMatcher(isAnyOf(startLoadingSong), (state) => {
			return { ...state, isLoading: true };
		});
		builder.addMatcher(isAnyOf(finishLoadingSong, reloadWaveform), (state) => {
			return { ...state, isLoading: false };
		});
		builder.addMatcher(isAnyOf(startImportingSong), (state) => {
			return { ...state, isProcessingImport: true };
		});
		builder.addMatcher(isAnyOf(importExistingSong, cancelImportingSong), (state) => {
			return { ...state, isProcessingImport: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
