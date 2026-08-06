import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { BEATS_PER_ZOOM_LEVEL } from "$/constants";
import { cycleToNextTool, cycleToPrevTool } from "$/store/actions";
import { EventColor, EventEditMode, EventTool, View } from "$/types";

const EVENT_TOOLS = Object.values(EventTool);
const EVENT_EDIT_MODES = Object.values(EventEditMode);
const EVENT_COLORS = Object.values(EventColor);

const initialState = {
	zoomLevel: 2,
	isLockedToCurrentWindow: false,
	areLasersLocked: false,
	showLightingPreview: false,
	rowHeight: 40,
	backgroundOpacity: 0.85,
	selectedEditMode: EVENT_EDIT_MODES[0],
	selectedBeat: null as number | null,
	selectedTool: EVENT_TOOLS[0],
	selectedColor: EVENT_COLORS[0],
};

const slice = createSlice({
	name: "lightshow",
	initialState: initialState,
	selectors: {
		selectTool: (state) => state.selectedTool,
		selectColor: (state) => state.selectedColor,
		selectEditMode: (state) => state.selectedEditMode,
		selectCursor: (state) => state.selectedBeat,
		selectPreview: (state) => state.showLightingPreview,
		selectTrackHeight: (state) => state.rowHeight,
		selectTrackOpacity: (state) => state.backgroundOpacity,
		selectWindowLock: (state) => state.isLockedToCurrentWindow,
		selectMirrorLock: (state) => state.areLasersLocked,
		selectZoomLevel: (state) => state.zoomLevel,
		selectBeatsPerZoomLevel: (state) => BEATS_PER_ZOOM_LEVEL[state.zoomLevel],
	},
	reducers: (api) => {
		return {
			updateTool: api.reducer<EventTool>((state, action) => {
				return { ...state, selectedTool: action.payload };
			}),
			updateColor: api.reducer<EventColor>((state, action) => {
				return { ...state, selectedColor: action.payload };
			}),
			updateEditMode: api.reducer<EventEditMode>((state, action) => {
				return { ...state, selectedEditMode: action.payload };
			}),
			updateCursor: api.reducer<{ selectedBeat: number }>((state, action) => {
				const { selectedBeat } = action.payload;
				return { ...state, selectedBeat: selectedBeat };
			}),
			updateTrackHeight: api.reducer<number>((state, action) => {
				return { ...state, rowHeight: action.payload };
			}),
			updateTrackOpacity: api.reducer<number>((state, action) => {
				return { ...state, backgroundOpacity: action.payload };
			}),
			updatePreview: api.reducer<boolean | undefined>((state, action) => {
				return { ...state, showLightingPreview: action.payload ?? !state.showLightingPreview };
			}),
			updateWindowLock: api.reducer<boolean | undefined>((state, action) => {
				return { ...state, isLockedToCurrentWindow: action.payload ?? !state.isLockedToCurrentWindow };
			}),
			updateMirrorLock: api.reducer<boolean | undefined>((state, action) => {
				return { ...state, areLasersLocked: action.payload ?? !state.areLasersLocked };
			}),
			updateZoomLevel: api.reducer<number>((state, action) => {
				return { ...state, zoomLevel: action.payload };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addMatcher(isAnyOf(cycleToNextTool, cycleToPrevTool), (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const currentlySelectedTool = state.selectedTool;
			const incrementBy = cycleToNextTool.match(action) ? +1 : -1;
			const currentToolIndex = EVENT_TOOLS.indexOf(currentlySelectedTool);
			const nextTool = EVENT_TOOLS[(currentToolIndex + EVENT_TOOLS.length + incrementBy) % EVENT_TOOLS.length];
			return { ...state, selectedTool: nextTool };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
