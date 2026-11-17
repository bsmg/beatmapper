import { createAction, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { NoteDirection } from "bsmap";

import { type IGrid, type IGridPresets, ObjectColor, type ObjectSelectionMode, ObjectType, type SongId, View } from "$/types";
import { cycleToNextTool, cycleToPrevTool } from "./actions";

const NOTE_TOOLS = Object.values(ObjectType);

const initialState = {
	selectedType: ObjectType.NOTE as ObjectType,
	selectedColor: ObjectColor.LEFT as ObjectColor,
	selectedDirection: 8 as NoteDirection,
	angleOffsetStep: 15,
	selectionMode: null as ObjectSelectionMode | null, // null | 'select' | 'deselect' | 'delete'.
	gridPresets: {} as IGridPresets,
};

const slice = createSlice({
	name: "beatmap",
	initialState: initialState,
	selectors: {
		selectType: (state) => state.selectedType,
		selectColor: (state) => state.selectedColor,
		selectDirection: (state) => state.selectedDirection,
		selectAngleOffsetStep: (state) => state.angleOffsetStep,
		selectSelectionMode: (state) => state.selectionMode,
		selectGridPresets: (state) => state.gridPresets,
		selectAllGridPresetIds: (state) => Object.keys(state.gridPresets),
		selectGridPresetById: (state, id: string) => state.gridPresets[id],
	},
	reducers: (api) => {
		return {
			updateType: api.reducer<ObjectType>((state, action) => {
				return { ...state, selectedType: action.payload };
			}),
			updateColor: api.reducer<ObjectColor>((state, action) => {
				return { ...state, selectedColor: action.payload };
			}),
			updateDirection: api.reducer<NoteDirection>((state, action) => {
				return { ...state, selectedDirection: action.payload };
			}),
			updateAngleOffsetStep: api.reducer<number>((state, action) => {
				return { ...state, angleOffsetStep: action.payload };
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
			const currentlySelectedTool = state.selectedType;
			const incrementBy = cycleToNextTool.match(action) ? +1 : -1;
			const currentToolIndex = NOTE_TOOLS.indexOf(currentlySelectedTool);
			const nextType = NOTE_TOOLS[(currentToolIndex + NOTE_TOOLS.length + incrementBy) % NOTE_TOOLS.length];
			return { ...state, selectedType: nextType };
		});
		builder.addDefaultCase((state) => state);
	},
});

export const {
	selectType: selectNotesEditorType,
	selectColor: selectNotesEditorColor,
	selectDirection: selectNotesEditorDirection,
	selectAngleOffsetStep: selectNotesEditorAngleOffsetStep,
	selectSelectionMode: selectNotesEditorSelectionMode,
	selectGridPresets,
	selectAllGridPresetIds,
	selectGridPresetById,
} = slice.getSelectors(slice.selectSlice);

export const { updateType: updateNotesEditorType, updateColor: updateNotesEditorColor, updateDirection: updateNotesEditorDirection, updateAngleOffsetStep: updateNotesEditorAngleOffsetStep, upsertGridPresets, upsertGridPreset, removeGridPreset } = slice.actions;

export const startManagingNoteSelection = createAction("startManagingNoteSelection", (args: { selectionMode: ObjectSelectionMode }) => {
	return { payload: { ...args } };
});
export const finishManagingNoteSelection = createAction("finishManagingNoteSelection");

export default slice;
