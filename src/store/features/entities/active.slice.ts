import { createSlice } from "@reduxjs/toolkit";

import { createNewSong, leaveEditor, startLoadingSong } from "$/store/actions";
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
		builder.addCase(createNewSong.fulfilled, (_, action) => {
			const { songId, selectedDifficulty } = action.payload;
			return { song: songId, beatmap: selectedDifficulty };
		});
		builder.addCase(startLoadingSong, (_, action) => {
			const { songId, beatmapId: difficulty } = action.payload;
			return { song: songId, beatmap: difficulty };
		});
		builder.addCase(leaveEditor, () => {
			return { song: null, beatmap: null };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
