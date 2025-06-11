import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { addSongFromFile, finishLoadingMap, reloadVisualizer, startLoadingMap } from "$/store/actions";

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
		selectLoading: (state) => state.isLoading,
		selectProcessingImport: (state) => state.isProcessingImport,
	},
	reducers: {
		init: (state) => {
			return { ...state, initialized: true };
		},
	},
	extraReducers: (builder) => {
		builder.addMatcher(isAnyOf(startLoadingMap), (state) => {
			return { ...state, isLoading: true };
		});
		builder.addMatcher(isAnyOf(finishLoadingMap, reloadVisualizer), (state) => {
			return { ...state, isLoading: false };
		});
		builder.addMatcher(isAnyOf(addSongFromFile.pending), (state) => {
			return { ...state, isProcessingImport: true };
		});
		builder.addMatcher(isAnyOf(addSongFromFile.fulfilled, addSongFromFile.rejected), (state) => {
			return { ...state, isProcessingImport: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
