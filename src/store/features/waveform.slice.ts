import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type WaveformData from "waveform-data";

import { finishLoadingSong, leaveEditor, reloadWaveform, zoomWaveform } from "$/store/actions";

const initialState = {
	data: null as WaveformData | null,
	zoomAmount: 0,
	zoomCursorPosition: null as number | null,
};

const slice = createSlice({
	name: "waveform",
	initialState: initialState,
	selectors: {
		getWaveformData: (state) => state.data,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(zoomWaveform, (state, action) => {
			const { amount } = action.payload;
			let newWaveformZoom = state.zoomAmount + amount;
			// `0` is the default zoom, which means that there's 0% zoom. We don't want to allow negative zoom.
			// I might also want to add a max zoom, but I'm gonna wait and see on that.
			newWaveformZoom = Math.max(newWaveformZoom, 0);
			return { ...state, waveformZoom: newWaveformZoom };
		});
		builder.addCase(leaveEditor, () => initialState);
		builder.addMatcher(isAnyOf(finishLoadingSong, reloadWaveform), (state, action) => {
			const { waveformData } = action.payload;
			return { ...state, data: waveformData, zoomAmount: 0, zoomCursorPosition: null };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
