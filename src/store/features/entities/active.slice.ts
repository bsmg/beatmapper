import { createSlice } from "@reduxjs/toolkit";

import { leaveEditor, startLoadingMap } from "$/store/actions";
import type { BeatmapId, SongId } from "$/types";

const initialState = {
	song: null as SongId | null,
	beatmap: null as BeatmapId | null,
};

const slice = createSlice({
	name: "active",
	initialState: initialState,
	selectors: {
		selectActiveSongId: (state) => state.song,
		selectActiveBeatmapId: (state) => state.beatmap,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(startLoadingMap, (_, action) => {
			const { songId, beatmapId } = action.payload;
			return { song: songId, beatmap: beatmapId };
		});
		builder.addCase(leaveEditor, () => {
			return { song: null, beatmap: null };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
