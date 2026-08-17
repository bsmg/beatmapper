import { createEntityAdapter, createSlice, type EntityId, isAnyOf } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { resolveBookmarkId } from "$/helpers/bookmarks.helpers";
import { leaveEditor, loadBeatmapEntities, startLoadingMap } from "$/store/actions";
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
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { bookmarks } = action.payload;
			return adapter.setAll(state, bookmarks ?? []);
		});
		builder.addMatcher(isAnyOf(startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
