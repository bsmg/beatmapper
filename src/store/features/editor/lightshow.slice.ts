import { type ReducerCreators, createSlice, isAnyOf } from "@reduxjs/toolkit";

import { BEATS_PER_ZOOM_LEVEL, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import { cycleToNextTool, cycleToPrevTool, hydrateSession } from "$/store/actions";
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

function updateZoomLevel(api: ReducerCreators<typeof initialState>, update: (current: number) => number) {
	return api.reducer((state) => {
		return { ...state, zoomLevel: update(state.zoomLevel) };
	});
}

const slice = createSlice({
	name: "events",
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
			updateTool: api.reducer<{ tool: EventTool }>((state, action) => {
				const { tool } = action.payload;
				return { ...state, selectedTool: tool };
			}),
			updateColor: api.reducer<{ color: EventColor }>((state, action) => {
				const { color } = action.payload;
				return { ...state, selectedColor: color };
			}),
			updateEditMode: api.reducer<{ editMode: EventEditMode }>((state, action) => {
				const { editMode } = action.payload;
				return { ...state, selectedEditMode: editMode };
			}),
			updateCursor: api.reducer<{ selectedBeat: number }>((state, action) => {
				const { selectedBeat } = action.payload;
				return { ...state, selectedBeat: selectedBeat };
			}),
			updateTrackHeight: api.reducer<{ newHeight: number }>((state, action) => {
				const { newHeight } = action.payload;
				return { ...state, rowHeight: newHeight };
			}),
			updateTrackOpacity: api.reducer<{ newOpacity: number }>((state, action) => {
				const { newOpacity } = action.payload;
				return { ...state, backgroundOpacity: newOpacity };
			}),
			updatePreview: api.reducer<{ checked?: boolean } | undefined>((state, action) => {
				const { checked } = action.payload ?? {};
				if (checked) return { ...state, showLightingPreview: checked };
				return { ...state, showLightingPreview: !state.showLightingPreview };
			}),
			updateWindowLock: api.reducer<{ checked?: boolean } | undefined>((state, action) => {
				const { checked } = action.payload ?? {};
				if (checked) return { ...state, isLockedToCurrentWindow: checked };
				return { ...state, isLockedToCurrentWindow: !state.isLockedToCurrentWindow };
			}),
			updateMirrorLock: api.reducer<{ checked?: boolean } | undefined>((state, action) => {
				const { checked } = action.payload ?? {};
				if (checked) return { ...state, areLasersLocked: checked };
				return { ...state, areLasersLocked: !state.areLasersLocked };
			}),
			incrementZoom: updateZoomLevel(api, (current) => Math.min(ZOOM_LEVEL_MAX, current + 1)),
			decrementZoom: updateZoomLevel(api, (current) => Math.max(ZOOM_LEVEL_MIN, current - 1)),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(hydrateSession, (state, action) => {
			const {
				"events.mode": selectedEditMode,
				"events.tool": selectedTool,
				"events.color": selectedColor,
				"events.zoom": zoomLevel,
				"events.preview": showLightingPreview,
				"events.opacity": backgroundOpacity,
				"events.height": rowHeight,
				"events.loop": isLockedToCurrentWindow,
				"events.mirror": areLasersLocked,
			} = action.payload;
			if (selectedEditMode !== undefined) state.selectedEditMode = Object.values(EventEditMode)[selectedEditMode];
			if (selectedTool !== undefined) state.selectedTool = Object.values(EventTool)[selectedTool];
			if (selectedColor !== undefined) state.selectedColor = Object.values(EventColor)[selectedColor];
			if (zoomLevel !== undefined) state.zoomLevel = zoomLevel;
			if (showLightingPreview !== undefined) state.showLightingPreview = showLightingPreview;
			if (backgroundOpacity !== undefined) state.backgroundOpacity = backgroundOpacity;
			if (rowHeight !== undefined) state.rowHeight = rowHeight;
			if (isLockedToCurrentWindow !== undefined) state.isLockedToCurrentWindow = isLockedToCurrentWindow;
			if (areLasersLocked !== undefined) state.areLasersLocked = areLasersLocked;
		});
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
