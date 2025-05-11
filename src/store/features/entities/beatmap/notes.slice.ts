import { type EntityId, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { createColorNote, mirrorNoteColor, sortObjectFn } from "bsmap";

import { mirrorItem, nudgeItem, resolveTimeForItem } from "$/helpers/item.helpers";
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
import { type App, ObjectTool, ObjectType, View } from "$/types";

const adapter = createEntityAdapter<App.IColorNote, EntityId>({
	selectId: resolveNoteId,
	sortComparer: sortObjectFn,
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
			const { tool: selectedTool, cursorPositionInBeats: beatNum, colIndex, rowIndex, direction } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			if (!direction) return state;
			const color = Object.values(ObjectTool).indexOf(selectedTool) as 0 | 1;
			return adapter.addOne(state, createColorNote({ time: beatNum, posX: colIndex, posY: rowIndex, color: color, direction: direction }));
		});
		builder.addCase(clearCellOfNotes.fulfilled, (state, action) => {
			const { tool: selectedTool, cursorPositionInBeats: beatNum, colIndex, rowIndex } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			const match = selectByPosition(state, { time: beatNum, posX: colIndex, posY: rowIndex });
			if (!match) return state;
			return adapter.removeOne(state, adapter.selectId(match));
		});
		builder.addCase(setBlockByDragging.fulfilled, (state, action) => {
			const { tool: selectedTool, cursorPositionInBeats: beatNum, colIndex, rowIndex, direction } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			const color = Object.values(ObjectTool).indexOf(selectedTool) as 0 | 1;
			const match = selectByPosition(state, { time: beatNum, posX: colIndex, posY: rowIndex });
			if (!match) return adapter.upsertOne(state, createColorNote({ time: beatNum, posX: colIndex, posY: rowIndex, color: color, direction: direction }));
			return adapter.updateOne(state, { id: adapter.selectId(match), changes: { direction: direction } });
		});
		builder.addCase(toggleNoteColor, (state, action) => {
			const { time: beatNum, posX: colIndex, posY: rowIndex } = action.payload;
			const match = selectByPosition(state, { time: beatNum, posX: colIndex, posY: rowIndex });
			if (!match) return state;
			const color = mirrorNoteColor(match.color);
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
			const timeShiftedEntities = data.notes.map((x) => ({ ...x, selected: true, time: resolveTimeForItem(x) + deltaBetweenPeriods }));
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
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.time >= start && x.time < end } })),
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
			const { time: beatNum, posX: colIndex, posY: rowIndex } = action.payload;
			const match = selectByPosition(state, { time: beatNum, posX: colIndex, posY: rowIndex });
			if (!match) return state;
			return adapter.removeOne(state, adapter.selectId(match));
		});
		builder.addMatcher(isAnyOf(selectNote, deselectNote), (state, action) => {
			const { time: beatNum, posX: colIndex, posY: rowIndex } = action.payload;
			const match = selectByPosition(state, { time: beatNum, posX: colIndex, posY: rowIndex });
			if (!match) return state;
			const selected = selectNote.match(action);
			return adapter.updateOne(state, { id: adapter.selectId(match), changes: { selected: selected } });
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
