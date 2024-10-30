import { createSlice } from "@reduxjs/toolkit";

import { createNewSong, startLoadingSong } from "$/store/actions";
import type { BeatmapId } from "$/types";

const initialState = null as BeatmapId | null;

const slice = createSlice({
	name: "difficulty",
	initialState: initialState,
	selectors: {
		getDifficulty: (state) => state,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(createNewSong.fulfilled, (_, action) => {
			const { selectedDifficulty } = action.payload;
			return selectedDifficulty;
		});
		builder.addCase(startLoadingSong, (_, action) => {
			const { difficulty } = action.payload;
			return difficulty;
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
