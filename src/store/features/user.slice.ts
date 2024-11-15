import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { createNewSong, dismissPrompt, finishLoadingSong, hydrateSnapshot, importExistingSong, updateGraphicsLevel, updateProcessingDelay, updateSongDetails } from "$/store/actions";
import { Quality } from "$/types";
import { STORAGE_KEY } from "../setup";

const initialState = {
	isNewUser: true,
	seenPrompts: [] as string[],
	stickyMapAuthorName: null as string | null,
	processingDelay: 60,
	graphicsLevel: Quality.HIGH as Quality,
};

const slice = createSlice({
	name: "user",
	initialState: initialState,
	selectors: {
		getIsNewUser: (state) => state.isNewUser,
		getSeenPrompts: (state) => state.seenPrompts,
		getStickyMapAuthorName: (state) => state.stickyMapAuthorName,
		getProcessingDelay: (state) => (typeof state.processingDelay === "number" ? state.processingDelay : initialState.processingDelay),
		getGraphicsLevel: (state) => (typeof state.graphicsLevel === "string" ? state.graphicsLevel : initialState.graphicsLevel),
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateSnapshot, (state, action) => {
			const hydrated = action.payload[STORAGE_KEY]?.user ?? state;
			return { ...state, ...hydrated };
		});
		builder.addCase(importExistingSong, (state, action) => {
			const { songData } = action.payload;
			if (songData.demo) return state;
			return { ...state, isNewUser: false };
		});
		builder.addCase(updateSongDetails, (state, action) => {
			const { mapAuthorName } = action.payload;
			return { ...state, stickyMapAuthorName: mapAuthorName ?? null };
		});
		builder.addCase(dismissPrompt, (state, action) => {
			const { promptId } = action.payload;
			return { ...state, seenPrompts: [...state.seenPrompts, promptId] };
		});
		builder.addCase(updateProcessingDelay, (state, action) => {
			const { newDelay } = action.payload;
			return { ...state, processingDelay: newDelay };
		});
		builder.addCase(updateGraphicsLevel, (state, action) => {
			const { newGraphicsLevel } = action.payload;
			return { ...state, graphicsLevel: newGraphicsLevel };
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, finishLoadingSong), (state) => {
			return { ...state, isNewUser: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
