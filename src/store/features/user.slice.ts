import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { createNewSong, dismissPrompt, finishLoadingSong, hydrateUser, importExistingSong, updateGraphicsLevel, updateProcessingDelay, updateSongDetails } from "$/store/actions";
import { Quality } from "$/types";

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
		selectIsNewUser: (state) => state.isNewUser,
		selectSeenPrompts: (state) => state.seenPrompts,
		selectStickyMapAuthorName: (state) => state.stickyMapAuthorName,
		selectProcessingDelay: (state) => (typeof state.processingDelay === "number" ? state.processingDelay : initialState.processingDelay),
		selectGraphicsLevel: (state) => (typeof state.graphicsLevel === "string" ? state.graphicsLevel : initialState.graphicsLevel),
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateUser, (state, action) => {
			const { "user.new": isNewUser, "user.username": stickyMapAuthorName, "user.announcements": seenPrompts, "audio.offset": processingDelay, "graphics.quality": graphicsLevel } = action.payload;
			if (isNewUser !== undefined) state.isNewUser = isNewUser;
			if (stickyMapAuthorName !== undefined) state.stickyMapAuthorName = stickyMapAuthorName;
			if (seenPrompts !== undefined) state.seenPrompts = seenPrompts;
			if (processingDelay !== undefined) state.processingDelay = processingDelay;
			if (graphicsLevel !== undefined) state.graphicsLevel = Object.values(Quality)[graphicsLevel];
		});
		builder.addCase(importExistingSong.fulfilled, (state, action) => {
			return { ...state, isNewUser: false };
		});
		builder.addCase(updateSongDetails, (state, action) => {
			const { songData } = action.payload;
			return { ...state, stickyMapAuthorName: songData.mapAuthorName ?? null };
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
