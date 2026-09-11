import { createEntityAdapter, createSlice, type EntityId } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { resolveBookmarkId } from "$/helpers/bookmarks.helpers";
import type { App } from "$/types";
import { leaveEditor, loadBeatmapContents } from "./actions";

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
	reducers: (api) => {
		return {
			addOne: api.reducer<App.IBookmark>((state, action) => {
				const { time, name, color } = action.payload;
				return adapter.addOne(state, { time: time, name, color });
			}),
			removeOne: api.reducer<{ beatNum: number }>((state, action) => {
				const { beatNum } = action.payload;
				return adapter.removeOne(state, resolveBookmarkId({ time: beatNum }));
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapContents.fulfilled, (state, action) => {
			return adapter.setAll(state, action.payload.entities.bookmarks ?? []);
		});
		builder.addCase(leaveEditor, () => adapter.getInitialState());
		builder.addDefaultCase((state) => state);
	},
});

export const { selectAll: selectAllBookmarks } = slice.getSelectors(slice.selectSlice);

export const { addOne: addBookmark, removeOne: removeBookmark } = slice.actions;

export default slice;
