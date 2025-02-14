import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { deleteGridPreset, finishManagingNoteSelection, hydrateGridPresets, hydrateSession, resizeObstacle, resizeSelectedObstacles, saveGridPreset, selectColor, selectNextTool, selectNoteDirection, selectPreviousTool, selectTool, startManagingNoteSelection } from "$/store/actions";
import { type GridPresets, type ObjectSelectionMode, ObjectTool, View } from "$/types";

const NOTE_TOOLS = Object.values(ObjectTool);

const initialState = {
	selectedTool: NOTE_TOOLS[0],
	selectedDirection: 8,
	selectionMode: null as ObjectSelectionMode | null, // null | 'select' | 'deselect' | 'delete'.
	defaultObstacleDuration: 4,
	gridPresets: {} as GridPresets,
};

const slice = createSlice({
	name: "notes",
	initialState: initialState,
	selectors: {
		selectSelectedNoteTool: (state) => state.selectedTool,
		selectSelectedCutDirection: (state) => state.selectedDirection,
		selectNoteSelectionMode: (state) => state.selectionMode,
		selectDefaultObstacleDuration: (state) => state.defaultObstacleDuration,
		selectGridPresets: (state) => state.gridPresets,
		selectAllGridPresetIds: (state) => Object.keys(state.gridPresets),
		selectGridPresetById: (state, id: string) => state.gridPresets[id],
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateSession, (state, action) => {
			const { "notes.tool": selectedTool, "notes.direction": selectedDirection, "notes.duration": defaultObstacleDuration } = action.payload;
			if (selectedTool !== undefined) state.selectedTool = Object.values(ObjectTool)[selectedTool];
			if (selectedDirection !== undefined) state.selectedDirection = selectedDirection;
			if (defaultObstacleDuration !== undefined) state.defaultObstacleDuration = defaultObstacleDuration;
		});
		builder.addCase(hydrateGridPresets, (state, action) => {
			const gridPresets = action.payload;
			return { ...state, gridPresets: { ...state.gridPresets, ...gridPresets } };
		});
		builder.addCase(selectNoteDirection, (state, action) => {
			const { direction } = action.payload;
			return { ...state, selectedDirection: direction };
		});
		builder.addCase(selectTool, (state, action) => {
			const { view, tool } = action.payload;
			if (view !== View.BEATMAP) return state;
			return { ...state, selectedTool: tool as ObjectTool };
		});
		builder.addCase(selectColor, (state, action) => {
			const { view, color } = action.payload;
			if (view !== View.BEATMAP) return state;
			let toolName: ObjectTool;
			if (color === "red") {
				toolName = ObjectTool.LEFT_NOTE;
			} else {
				toolName = ObjectTool.RIGHT_NOTE;
			}
			return { ...state, selectedTool: toolName };
		});
		builder.addCase(startManagingNoteSelection, (state, action) => {
			const { selectionMode } = action.payload;
			return { ...state, selectionMode: selectionMode };
		});
		builder.addCase(finishManagingNoteSelection, (state) => {
			return { ...state, selectionMode: null };
		});
		builder.addCase(saveGridPreset.fulfilled, (state, action) => {
			const { grid, presetSlot } = action.payload;
			return { ...state, gridPresets: { ...state.gridPresets, [presetSlot]: grid } };
		});
		builder.addCase(deleteGridPreset, (state, action) => {
			const { presetSlot } = action.payload;
			delete state.gridPresets[presetSlot];
		});
		builder.addMatcher(isAnyOf(selectNextTool, selectPreviousTool), (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const currentlySelectedTool = state.selectedTool;
			const incrementBy = selectNextTool.match(action) ? +1 : -1;
			const currentToolIndex = NOTE_TOOLS.indexOf(currentlySelectedTool);
			const nextTool = NOTE_TOOLS[(currentToolIndex + NOTE_TOOLS.length + incrementBy) % NOTE_TOOLS.length];
			return { ...state, selectedTool: nextTool };
		});
		builder.addMatcher(isAnyOf(resizeObstacle, resizeSelectedObstacles), (state, action) => {
			const { newBeatDuration } = action.payload;
			return { ...state, defaultObstacleDuration: newBeatDuration };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
