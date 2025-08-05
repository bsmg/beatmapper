import { type AsyncThunkPayloadCreator, isAnyOf } from "@reduxjs/toolkit";
import type { NoteDirection } from "bsmap";

import { cycleToNextTool, cycleToPrevTool, finishManagingNoteSelection, hydrateGridPresets, hydrateSession, startManagingNoteSelection, updateAllSelectedObstacles, updateObstacle } from "$/store/actions";
import { createSlice } from "$/store/helpers";
import { selectGridSize } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type IGrid, type IGridPresets, type ObjectSelectionMode, ObjectTool, type SongId, View } from "$/types";

const NOTE_TOOLS = Object.values(ObjectTool);

const initialState = {
	selectedTool: NOTE_TOOLS[0],
	selectedDirection: 8 as NoteDirection,
	selectionMode: null as ObjectSelectionMode | null, // null | 'select' | 'deselect' | 'delete'.
	defaultObstacleDuration: 4,
	gridPresets: {} as IGridPresets,
};

const fetchGridSize: AsyncThunkPayloadCreator<{ presetSlot: string; grid: IGrid }, { songId: SongId; presetSlot: string }> = (args, api) => {
	const state = api.getState() as RootState;
	const grid = selectGridSize(state, args.songId ?? null);
	return api.fulfillWithValue({ ...args, grid });
};

const slice = createSlice({
	name: "notes",
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
			updateTool: api.reducer<{ tool: ObjectTool }>((state, action) => {
				const { tool } = action.payload;
				return { ...state, selectedTool: tool };
			}),
			updateDirection: api.reducer<{ direction: NoteDirection }>((state, action) => {
				const { direction } = action.payload;
				return { ...state, selectedDirection: direction };
			}),
			upsertGridPreset: api.asyncThunk(fetchGridSize, {
				fulfilled: (state, action) => {
					const { presetSlot: key, grid: value } = action.payload;
					return { ...state, gridPresets: { ...state.gridPresets, [key]: value } };
				},
			}),
			removeGridPreset: api.reducer<{ songId: SongId; presetSlot: string }>((state, action) => {
				const { presetSlot } = action.payload;
				delete state.gridPresets[presetSlot];
			}),
		};
	},
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
		builder.addMatcher(isAnyOf(updateObstacle, updateAllSelectedObstacles), (state, action) => {
			const { changes } = action.payload;
			if (!("duration" in changes) || !changes.duration) return state;
			return { ...state, defaultObstacleDuration: changes.duration };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
