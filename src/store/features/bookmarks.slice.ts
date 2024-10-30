import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { createBookmark, createNewSong, deleteBookmark, leaveEditor, loadBeatmapEntities, startLoadingSong } from "$/store/actions";
import type { App } from "$/types";

const initialState = {} as Record<number, App.Bookmark>;

const slice = createSlice({
	name: "bookmarks",
	initialState: initialState,
	selectors: {
		getBookmarks: (state) => state,
		getSortedBookmarksArray: (state) => {
			const bookmarksArray = Object.values(state);
			return bookmarksArray.sort((a, b) => a.beatNum - b.beatNum);
		},
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (_, action) => {
			const { bookmarks } = action.payload;
			// The initial data is loaded as an array, we need to convert it to a map.
			return bookmarks.reduce((acc, bookmark) => {
				acc[bookmark.beatNum] = bookmark;
				return acc;
			}, initialState);
		});
		builder.addCase(createBookmark.fulfilled, (state, action) => {
			const { beatNum, name, color } = action.payload;
			return { ...state, [beatNum]: { beatNum: beatNum, name: name, color: color } };
		});
		builder.addCase(deleteBookmark, (state, action) => {
			const { beatNum } = action.payload;
			delete state[beatNum];
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong, leaveEditor), () => initialState);
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
