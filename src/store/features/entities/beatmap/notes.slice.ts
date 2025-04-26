import { type EntityId, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";

import { mirrorItem, nudgeItem, resolveBeatForItem } from "$/helpers/item.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
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
	selectAll as selectAllEntities,
	selectAllInRange,
	selectNote,
	setBlockByDragging,
	startLoadingSong,
	swapSelectedNotes,
	toggleNoteColor,
} from "$/store/actions";
import { createByPositionSelector, createSelectedEntitiesSelector } from "$/store/helpers";
import { App, ObjectTool, ObjectType, View } from "$/types";
import { cycle } from "$/utils";
import { NoteDirection } from "bsmap";

const adapter = createEntityAdapter<App.ColorNote, EntityId>({
	selectId: resolveNoteId,
});
const { selectAll, selectTotal } = adapter.getSelectors();
const selectAllSelected = createSelectedEntitiesSelector(selectAll);
const selectByPosition = createByPositionSelector(selectAll);

const slice = createSlice({
	name: "notes",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectTotal: selectTotal,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { notes } = action.payload;
			return adapter.setAll(state, notes ?? []);
		});
		builder.addCase(clickPlacementGrid.fulfilled, (state, action) => {
			const { tool: selectedTool, cursorPositionInBeats: beatNum, colIndex, rowIndex, direction: selectedDirection } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			if (!selectedDirection) return state;
			const color = Object.values(App.SaberColor)[Object.values(ObjectTool).indexOf(selectedTool)];
			const direction = Object.values(App.CutDirection)[Object.values(NoteDirection).indexOf(selectedDirection)];
			return adapter.addOne(state, { id: resolveNoteId({ beatNum, colIndex, rowIndex }), beatNum, colIndex, rowIndex, color: color, direction: direction });
		});
		builder.addCase(clearCellOfNotes.fulfilled, (state, action) => {
			const { tool: selectedTool, cursorPositionInBeats: beatNum, colIndex, rowIndex } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			const match = selectByPosition(state, { beatNum, colIndex, rowIndex });
			if (!match) return state;
			return adapter.removeOne(state, adapter.selectId(match));
		});
		builder.addCase(setBlockByDragging.fulfilled, (state, action) => {
			const { tool: selectedTool, cursorPositionInBeats: beatNum, colIndex, rowIndex, direction: selectedDirection } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			const color = Object.values(App.SaberColor)[Object.values(ObjectTool).indexOf(selectedTool)];
			const direction = Object.values(App.CutDirection)[Object.values(NoteDirection).indexOf(selectedDirection)];
			const match = selectByPosition(state, { beatNum, colIndex, rowIndex });
			if (!match) return adapter.upsertOne(state, { id: resolveNoteId({ beatNum, colIndex, rowIndex }), beatNum, colIndex, rowIndex, color: color, direction: direction });
			return adapter.updateOne(state, { id: adapter.selectId(match), changes: { direction: direction } });
		});
		builder.addCase(toggleNoteColor, (state, action) => {
			const { time: beatNum, lineIndex: colIndex, lineLayer: rowIndex } = action.payload;
			const match = selectByPosition(state, { beatNum, colIndex, rowIndex });
			if (!match) return state;
			const color = cycle(Object.values(App.SaberColor), match.color);
			return adapter.updateOne(state, { id: adapter.selectId(match), changes: { color } });
		});
		builder.addCase(deleteSelectedNotes, (state) => {
			const entities = selectAllSelected(state);
			return adapter.removeMany(
				state,
				entities.map((x) => adapter.selectId(x)),
			);
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAllSelected(state);
			return adapter.removeMany(
				state,
				entities.map((x) => adapter.selectId(x)),
			);
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, deltaBetweenPeriods } = action.payload;
			if (view !== View.BEATMAP) return state;
			if (!data.notes) return state;
			const entities = selectAll(state);
			adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
			const timeShiftedEntities = data.notes.map((note) => ({ ...note, selected: true, beatNum: resolveBeatForItem(note) + deltaBetweenPeriods }));
			return adapter.upsertMany(state, timeShiftedEntities);
		});
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: true } })),
			);
		});
		builder.addCase(deselectAll, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addCase(selectAllInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.beatNum >= start && x.beatNum < end } })),
			);
		});
		builder.addCase(swapSelectedNotes, (state, action) => {
			const { axis } = action.payload;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: mirrorItem(x, axis) })),
			);
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: nudgeItem(x, direction, amount) })),
			);
		});
		builder.addCase(deselectAllOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType !== ObjectType.NOTE) return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong, leaveEditor), () => adapter.getInitialState());
		builder.addMatcher(isAnyOf(deleteNote, bulkDeleteNote), (state, action) => {
			const { time: beatNum, lineIndex: colIndex, lineLayer: rowIndex } = action.payload;
			const match = selectByPosition(state, { beatNum, colIndex, rowIndex });
			if (!match) return state;
			return adapter.removeOne(state, adapter.selectId(match));
		});
		builder.addMatcher(isAnyOf(selectNote, deselectNote), (state, action) => {
			const { time: beatNum, lineIndex: colIndex, lineLayer: rowIndex } = action.payload;
			const match = selectByPosition(state, { beatNum, colIndex, rowIndex });
			if (!match) return state;
			const selected = selectNote.match(action);
			return adapter.updateOne(state, { id: adapter.selectId(match), changes: { selected: selected } });
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
