import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { getBeatNumForItem } from "$/helpers/item.helpers";
import { findNoteIndexByProperties, nudgeNotes, swapNotes } from "$/helpers/notes.helpers";
import {
	bulkDeleteNote,
	clearCellOfNotes,
	clickPlacementGrid,
	createNewSong,
	cutSelection,
	deleteNote,
	deleteSelectedNotes,
	deselectAll,
	deselectAllOfType,
	deselectNote,
	leaveEditor,
	loadBeatmapEntities,
	nudgeSelection,
	pasteSelection,
	selectAll,
	selectAllInRange,
	selectNote,
	setBlockByDragging,
	startLoadingSong,
	swapSelectedNotes,
	toggleNoteColor,
} from "$/store/actions";
import { type BeatmapEntities, ObjectTool, ObjectType, View } from "$/types";

const initialState = [] as BeatmapEntities["notes"];

function getItemType(item: ObjectTool) {
	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			return 0;
		}
		case ObjectTool.RIGHT_NOTE: {
			return 1;
		}
		case ObjectTool.BOMB_NOTE: {
			return 3;
		}
		default: {
			throw new Error(`Unrecognized item: ${item}`);
		}
	}
}

const slice = createSlice({
	name: "notes",
	initialState: initialState,
	selectors: {
		getNotes: (state) => state,
		getSelectedNotes: (state) => state.filter((x) => x.selected),
		getSelectedBlocks: (state) => state.filter((x) => x.selected && x._type < 2),
		getSelectedMines: (state) => state.filter((x) => x.selected && x._type === 3),
		getNumOfBlocks: (state) => state.filter((x) => x._type < 2).length,
		getNumOfMines: (state) => state.filter((x) => x._type === 3).length,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (_, action) => {
			const { notes } = action.payload;
			return notes ?? initialState;
		});
		builder.addCase(clickPlacementGrid.fulfilled, (state, action) => {
			const { rowIndex, colIndex, cursorPositionInBeats, direction: selectedDirection, tool: selectedTool } = action.payload;
			// Make sure there isn't already a note in this location.
			const alreadyExists = state.some((note) => note._time === cursorPositionInBeats && note._lineIndex === colIndex && note._lineLayer === rowIndex);
			if (alreadyExists) {
				console.warn("Tried to add a double-note in the same spot. Rejected.");
				return state;
			}
			if (selectedDirection === null || selectedTool === null) return state;
			return [...state, { _time: cursorPositionInBeats, _lineIndex: colIndex, _lineLayer: rowIndex, _type: getItemType(selectedTool), _cutDirection: selectedDirection }];
		});
		builder.addCase(clearCellOfNotes.fulfilled, (state, action) => {
			const { rowIndex, colIndex, cursorPositionInBeats } = action.payload;
			const matchedNoteIndex = state.findIndex((block) => {
				return block._lineIndex === colIndex && block._lineLayer === rowIndex && block._time === cursorPositionInBeats;
			});
			if (matchedNoteIndex === -1) return state;
			return [...state.slice(0, matchedNoteIndex), ...state.slice(matchedNoteIndex + 1)];
		});
		builder.addCase(setBlockByDragging.fulfilled, (state, action) => {
			const { direction, rowIndex, colIndex, cursorPositionInBeats, selectedTool } = action.payload;
			const existingBlockIndex = state.findIndex((note) => note._time === cursorPositionInBeats && note._lineIndex === colIndex && note._lineLayer === rowIndex);
			const newBlock = {
				_time: cursorPositionInBeats,
				_lineIndex: colIndex,
				_lineLayer: rowIndex,
				_type: getItemType(selectedTool),
				_cutDirection: direction,
			};
			if (existingBlockIndex === -1) return [...state, newBlock];
			return [...state.slice(0, existingBlockIndex), newBlock, ...state.slice(existingBlockIndex + 1)];
		});
		builder.addCase(deleteSelectedNotes, (state) => {
			return state.filter((note) => !note.selected);
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.filter((note) => !note.selected);
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, deltaBetweenPeriods } = action.payload;
			if (view !== View.BEATMAP) return state;
			if (!data.notes) return state;
			const deselectedState = state.map((note) => ({ ...note, selected: false }));
			const timeShiftedNotes = data.notes.map((note) => ({ ...note, selected: true, _time: getBeatNumForItem(note) + deltaBetweenPeriods }));
			return [...deselectedState, ...timeShiftedNotes];
		});
		builder.addCase(toggleNoteColor, (state, action) => {
			const { time, lineLayer, lineIndex } = action.payload;
			const noteIndex = findNoteIndexByProperties(state, { time, lineLayer, lineIndex });
			const note = state[noteIndex];
			// If this is a mine, do nothing
			if (note._type > 1) return state;
			return [...state.slice(0, noteIndex), { ...note, _type: note._type === 0 ? 1 : 0 }, ...state.slice(noteIndex + 1)];
		});
		builder.addCase(selectAll.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.map((note) => ({ ...note, selected: true }));
		});
		builder.addCase(deselectAll, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.map((note) => ({ ...note, selected: false }));
		});
		builder.addCase(selectAllInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.map((note) => {
				const selected = note._time >= start && note._time < end;
				return { ...note, selected: selected };
			});
		});
		builder.addCase(swapSelectedNotes, (state, action) => {
			const { axis } = action.payload;
			return swapNotes(axis, state);
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.BEATMAP) return state;
			return nudgeNotes(direction, amount, state);
		});
		builder.addCase(deselectAllOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType === ObjectType.OBSTACLE) return state;
			const typeMap = {
				0: ObjectType.NOTE,
				1: ObjectType.NOTE,
				3: ObjectType.BOMB,
			};
			return state.map((note) => {
				const matchesType = typeMap[note._type as 0 | 1 | 3] === itemType;
				if (!matchesType || !note.selected) return note;
				return { ...note, selected: false };
			});
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong, leaveEditor), () => initialState);
		builder.addMatcher(isAnyOf(deleteNote, bulkDeleteNote), (state, action) => {
			const { time, lineLayer, lineIndex } = action.payload;
			const noteIndex = findNoteIndexByProperties(state, { time, lineLayer, lineIndex });
			// This shouldn't be possible, but if it does somehow happen, it shouldn't crash everything.
			if (noteIndex === -1) return state;
			return [...state.slice(0, noteIndex), ...state.slice(noteIndex + 1)];
		});
		builder.addMatcher(isAnyOf(selectNote, deselectNote), (state, action) => {
			const { time, lineLayer, lineIndex } = action.payload;
			const noteIndex = findNoteIndexByProperties(state, { time, lineLayer, lineIndex });
			const selected = selectNote.match(action);
			// This shouldn't be possible, but if it does somehow happen, it shouldn't crash everything.
			if (noteIndex === -1) return state;
			const note = state[noteIndex];
			return [...state.slice(0, noteIndex), { ...note, selected }, ...state.slice(noteIndex + 1)];
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
