import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { finishLoadingMap, startLoadingMap } from "./actions";

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
	reducers: (api) => ({
		init: api.reducer((state) => {
			return { ...state, initialized: true };
		}),
		updateProcessingImport: api.reducer<boolean>((state, action) => {
			return { ...state, isProcessingImport: action.payload };
		}),
	}),
	extraReducers: (builder) => {
		builder.addMatcher(isAnyOf(startLoadingMap), (state) => {
			return { ...state, isLoading: true };
		});
		builder.addMatcher(isAnyOf(finishLoadingMap), (state) => {
			return { ...state, isLoading: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export const { selectInitialized, selectLoading, selectProcessingImport } = slice.getSelectors(slice.selectSlice);

export const { init, updateProcessingImport } = slice.actions;

export default slice;
