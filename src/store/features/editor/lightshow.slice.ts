import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { BEATS_PER_ZOOM_LEVEL, EVENT_COLORS, EVENT_EDIT_MODES, EVENT_TOOLS, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import {
	clearSelectionBox,
	commitSelection,
	drawSelectionBox,
	hydrateSnapshot,
	moveMouseAcrossEventsGrid,
	selectColor,
	selectEventEditMode,
	selectNextTool,
	selectPreviousTool,
	selectTool,
	toggleEventWindowLock,
	toggleLaserLock,
	togglePreviewLightingInEventsView,
	tweakEventBackgroundOpacity,
	tweakEventRowHeight,
	zoomIn,
	zoomOut,
} from "$/store/actions";
import { SNAPSHOT_KEY } from "$/store/setup";
import { type EventTool, type ISelectionBox, View } from "$/types";

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
	selectionBox: null as ISelectionBox | null,
};

const slice = createSlice({
	name: "events",
	initialState: initialState,
	selectors: {
		getSelectedEventEditMode: (state) => state.selectedEditMode,
		getSelectedEventTool: (state) => state.selectedTool,
		getSelectedEventColor: (state) => state.selectedColor,
		getZoomLevel: (state) => state.zoomLevel,
		getBeatsPerZoomLevel: (state) => BEATS_PER_ZOOM_LEVEL[state.zoomLevel],
		getSelectionBox: (state) => state.selectionBox,
		getShowLightingPreview: (state) => state.showLightingPreview,
		getRowHeight: (state) => state.rowHeight,
		getBackgroundOpacity: (state) => state.backgroundOpacity,
		getIsLockedToCurrentWindow: (state) => state.isLockedToCurrentWindow,
		getAreLasersLocked: (state) => state.areLasersLocked,
		getSelectedEventBeat: (state) => state.selectedBeat,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateSnapshot, (state, action) => {
			const hydrated = action.payload[SNAPSHOT_KEY]?.editor.events ?? state;
			return { ...state, ...hydrated };
		});
		builder.addCase(moveMouseAcrossEventsGrid, (state, action) => {
			const { selectedBeat } = action.payload;
			return { ...state, selectedBeat: selectedBeat };
		});
		builder.addCase(drawSelectionBox.fulfilled, (state, action) => {
			const { selectionBox } = action.payload;
			return { ...state, selectionBox: selectionBox };
		});
		builder.addCase(clearSelectionBox, (state) => {
			// Avoid a re-render if we already don't have a selectionBox
			if (!state.selectionBox) return state;
			return { ...state, selectionBox: null };
		});
		builder.addCase(commitSelection, (state) => {
			return { ...state, selectionBox: null };
		});
		builder.addCase(selectColor, (state, action) => {
			const { view, color } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return { ...state, selectedColor: color };
		});
		builder.addCase(selectTool, (state, action) => {
			const { view, tool } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return { ...state, selectedTool: tool as EventTool };
		});
		builder.addCase(selectEventEditMode, (state, action) => {
			const { editMode } = action.payload;
			return { ...state, selectedEditMode: editMode };
		});
		builder.addCase(zoomIn, (state) => {
			const newZoomLevel = Math.min(ZOOM_LEVEL_MAX, state.zoomLevel + 1);
			return { ...state, zoomLevel: newZoomLevel };
		});
		builder.addCase(zoomOut, (state) => {
			const newZoomLevel = Math.max(ZOOM_LEVEL_MIN, state.zoomLevel - 1);
			return { ...state, zoomLevel: newZoomLevel };
		});
		builder.addCase(toggleEventWindowLock, (state) => {
			return { ...state, isLockedToCurrentWindow: !state.isLockedToCurrentWindow };
		});
		builder.addCase(toggleLaserLock, (state) => {
			return { ...state, areLasersLocked: !state.areLasersLocked };
		});
		builder.addCase(togglePreviewLightingInEventsView, (state) => {
			return { ...state, showLightingPreview: !state.showLightingPreview };
		});
		builder.addCase(tweakEventRowHeight, (state, action) => {
			const { newHeight } = action.payload;
			return { ...state, rowHeight: newHeight };
		});
		builder.addCase(tweakEventBackgroundOpacity, (state, action) => {
			const { newOpacity } = action.payload;
			return { ...state, backgroundOpacity: newOpacity };
		});
		builder.addMatcher(isAnyOf(selectNextTool, selectPreviousTool), (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const currentlySelectedTool = state.selectedTool;
			const incrementBy = selectNextTool.match(action) ? +1 : -1;
			const currentToolIndex = EVENT_TOOLS.indexOf(currentlySelectedTool);
			const nextTool = EVENT_TOOLS[(currentToolIndex + EVENT_TOOLS.length + incrementBy) % EVENT_TOOLS.length];
			return { ...state, selectedTool: nextTool };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
