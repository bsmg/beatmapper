import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { addSong, addSongFromFile, finishLoadingMap, hydrateUser, updateSong } from "$/store/actions";
import { Quality } from "$/types";

const initialState = {
	isNewUser: true,
	seenPrompts: [] as string[],
	stickyMapAuthorName: "",
	processingDelay: 60,
	graphicsLevel: Quality.HIGH as Quality,
};

const slice = createSlice({
	name: "user",
	initialState: initialState,
	selectors: {
		selectNew: (state) => state.isNewUser,
		selectAnnouncements: (state) => state.seenPrompts,
		selectUsername: (state) => state.stickyMapAuthorName,
		selectProcessingDelay: (state) => (typeof state.processingDelay === "number" ? state.processingDelay : initialState.processingDelay),
		selectQuality: (state) => (typeof state.graphicsLevel === "string" ? state.graphicsLevel : initialState.graphicsLevel),
	},
	reducers: (api) => {
		return {
			updateUsername: api.reducer<{ value: string }>((state, action) => {
				const { value } = action.payload;
				return { ...state, stickyMapAuthorName: value };
			}),
			dismissPrompt: api.reducer<{ id: string }>((state, action) => {
				const { id } = action.payload;
				return { ...state, seenPrompts: [...state.seenPrompts, id] };
			}),
			updateProcessingDelay: api.reducer<{ value: number }>((state, action) => {
				const { value } = action.payload;
				return { ...state, processingDelay: value };
			}),
			updateGraphicsQuality: api.reducer<{ value: Quality }>((state, action) => {
				const { value } = action.payload;
				return { ...state, graphicsLevel: value };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(hydrateUser, (state, action) => {
			const { "user.new": isNewUser, "user.username": stickyMapAuthorName, "user.announcements": seenPrompts, "audio.offset": processingDelay, "graphics.quality": graphicsLevel } = action.payload;
			if (isNewUser !== undefined) state.isNewUser = isNewUser;
			if (stickyMapAuthorName !== undefined) state.stickyMapAuthorName = stickyMapAuthorName;
			if (seenPrompts !== undefined) state.seenPrompts = seenPrompts;
			if (processingDelay !== undefined) state.processingDelay = processingDelay;
			if (graphicsLevel !== undefined) state.graphicsLevel = Object.values(Quality)[graphicsLevel];
		});
		builder.addCase(addSongFromFile.fulfilled, (state) => {
			return { ...state, isNewUser: false };
		});
		builder.addCase(updateSong, (state, action) => {
			const { changes: songData } = action.payload;
			if (!songData.mapAuthorName) return state;
			return { ...state, stickyMapAuthorName: songData.mapAuthorName };
		});
		builder.addMatcher(isAnyOf(addSong, finishLoadingMap), (state) => {
			return { ...state, isNewUser: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
