import { type EntityId, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { resolveBookmarkId } from "$/helpers/bookmarks.helpers";
import { createBookmark, createNewSong, deleteBookmark, leaveEditor, loadBeatmapEntities, startLoadingSong } from "$/store/actions";
import type { App } from "$/types";

const adapter = createEntityAdapter<App.IBookmark, EntityId>({
	selectId: resolveBookmarkId,
	sortComparer: sortObjectFn,
});
const { selectAll } = adapter.getSelectors();

const slice = createSlice({
	name: "bookmarks",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { bookmarks } = action.payload;
			return adapter.setAll(state, bookmarks ?? []);
		});
		builder.addCase(createBookmark.fulfilled, (state, action) => {
			const { beatNum, name, color } = action.payload;
			return adapter.addOne(state, { time: beatNum, name, color });
		});
		builder.addCase(deleteBookmark, (state, action) => {
			const { beatNum } = action.payload;
			return adapter.removeOne(state, resolveBookmarkId({ time: beatNum }));
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong, leaveEditor), () => adapter.getInitialState());
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
