import { type AsyncThunkPayloadCreator, asyncThunkCreator, buildCreateSlice, createEntityAdapter, type EntityId, type GetThunkAPI, isAnyOf } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { resolveBookmarkId, resolveColorForBookmark } from "$/helpers/bookmarks.helpers";
import { addSong, leaveEditor, loadBeatmapEntities, startLoadingMap } from "$/store/actions";
import { selectCursorPositionInBeats } from "$/store/selectors";
import type { AppThunkApiConfig } from "$/store/types";
import type { App, RequiredKeys, SongId, View } from "$/types";

const adapter = createEntityAdapter<App.IBookmark, EntityId>({
	selectId: resolveBookmarkId,
	sortComparer: sortObjectFn,
});

const { selectAll } = adapter.getSelectors();

const slice = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })({
	name: "bookmarks",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
	},
	reducers: (api) => {
		const deriveDataFromState: AsyncThunkPayloadCreator<RequiredKeys<App.IBookmark, "time">, { songId: SongId; view: View; name: string }> = (args, api: GetThunkAPI<AppThunkApiConfig>) => {
			const state = api.getState();
			// we want to use the cursor position to figure out when to create the bookmark for
			const beatNum = selectCursorPositionInBeats(state, args.songId);
			if (beatNum === null) return api.rejectWithValue("Invalid beat number.");
			return api.fulfillWithValue({ ...args, time: beatNum, color: resolveColorForBookmark(args.name) });
		};

		return {
			addOne: api.asyncThunk(deriveDataFromState, {
				fulfilled: (state, action) => {
					const { time, name, color } = action.payload;
					return adapter.addOne(state, { time: time, name, color });
				},
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
		builder.addMatcher(isAnyOf(addSong, startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
