import { createSlice } from "@reduxjs/toolkit";
import type { JsonWaveformData } from "waveform-data";

import { leaveEditor, loadSongFile } from "$/store/actions";

const initialState = {
	waveform: null as JsonWaveformData | null,
	zoomAmount: 0,
	zoomCursorPosition: null as number | null,
};

const slice = createSlice({
	name: "visualizer",
	initialState: initialState,
	selectors: {
		selectWaveformData: (state) => state.waveform,
	},
	reducers: (api) => {
		return {
			updateZoom: api.reducer<{ value: number }>((state, action) => {
				const { value: amount } = action.payload;
				let newWaveformZoom = state.zoomAmount + amount;
				// `0` is the default zoom, which means that there's 0% zoom. We don't want to allow negative zoom.
				// I might also want to add a max zoom, but I'm gonna wait and see on that.
				newWaveformZoom = Math.max(newWaveformZoom, 0);
				return { ...state, waveformZoom: newWaveformZoom };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadSongFile.fulfilled, (state, action) => {
			return { ...state, waveform: action.payload.waveform };
		});
		builder.addCase(leaveEditor, () => initialState);
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
