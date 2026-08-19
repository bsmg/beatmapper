import { createAction, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { NoteDirection } from "bsmap";

import { type IGrid, type IGridPresets, type ObjectSelectionMode, ObjectTool, type SongId, View } from "$/types";
import { cycleToNextTool, cycleToPrevTool } from "./actions";

const NOTE_TOOLS = Object.values(ObjectTool);

const initialState = {
	selectedTool: NOTE_TOOLS[0],
	selectedDirection: 8 as NoteDirection,
	selectionMode: null as ObjectSelectionMode | null, // null | 'select' | 'deselect' | 'delete'.
	defaultObstacleDuration: 4,
	gridPresets: {} as IGridPresets,
};

const slice = createSlice({
	name: "beatmap",
	initialState: initialState,
	selectors: {
		selectTool: (state) => state.selectedTool,
		selectDirection: (state) => state.selectedDirection,
		selectSelectionMode: (state) => state.selectionMode,
		selectDefaultObstacleDuration: (state) => state.defaultObstacleDuration,
		selectGridPresets: (state) => state.gridPresets,
		selectAllGridPresetIds: (state) => Object.keys(state.gridPresets),
		selectGridPresetById: (state, id: string) => state.gridPresets[id],
	},
	reducers: (api) => {
		return {
			updateTool: api.reducer<ObjectTool>((state, action) => {
				return { ...state, selectedTool: action.payload };
			}),
			updateDirection: api.reducer<NoteDirection>((state, action) => {
				return { ...state, selectedDirection: action.payload };
			}),
			updateDefaultObstacleDuration: api.reducer<number>((state, action) => {
				return { ...state, defaultObstacleDuration: action.payload };
			}),
			upsertGridPresets: api.reducer<Record<string, IGrid>>((state, action) => {
				return { ...state, gridPresets: action.payload };
			}),
			upsertGridPreset: api.reducer<{ slot: string; grid: IGrid }>((state, action) => {
				const { slot: key, grid: value } = action.payload;
				return { ...state, gridPresets: { ...state.gridPresets, [key]: value } };
			}),
			removeGridPreset: api.reducer<{ songId: SongId; presetSlot: string }>((state, action) => {
				const { presetSlot } = action.payload;
				delete state.gridPresets[presetSlot];
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(startManagingNoteSelection, (state, action) => {
			const { selectionMode } = action.payload;
			return { ...state, selectionMode: selectionMode };
		});
		builder.addCase(finishManagingNoteSelection, (state) => {
			return { ...state, selectionMode: null };
		});
		builder.addMatcher(isAnyOf(cycleToNextTool, cycleToPrevTool), (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const currentlySelectedTool = state.selectedTool;
			const incrementBy = cycleToNextTool.match(action) ? +1 : -1;
			const currentToolIndex = NOTE_TOOLS.indexOf(currentlySelectedTool);
			const nextTool = NOTE_TOOLS[(currentToolIndex + NOTE_TOOLS.length + incrementBy) % NOTE_TOOLS.length];
			return { ...state, selectedTool: nextTool };
		});
		builder.addDefaultCase((state) => state);
	},
});

export const { selectTool: selectNotesEditorTool, selectDirection: selectNotesEditorDirection, selectSelectionMode: selectNotesEditorSelectionMode, selectDefaultObstacleDuration, selectGridPresets, selectAllGridPresetIds, selectGridPresetById } = slice.getSelectors(slice.selectSlice);

export const { updateTool: updateNotesEditorTool, updateDirection: updateNotesEditorDirection, updateDefaultObstacleDuration: updateNotesEditorDefaultObstacleDuration, upsertGridPresets, upsertGridPreset, removeGridPreset } = slice.actions;

export const startManagingNoteSelection = createAction("startManagingNoteSelection", (args: { selectionMode: ObjectSelectionMode }) => {
	return { payload: { ...args } };
});
export const finishManagingNoteSelection = createAction("finishManagingNoteSelection");

export default slice;
