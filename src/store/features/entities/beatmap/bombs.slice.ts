import { type EntityId, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { createBombNote, sortObjectFn } from "bsmap";

import { mirrorItem, nudgeItem, resolveTimeForItem } from "$/helpers/item.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import {
	addSong,
	addToCell,
	bulkRemoveNote,
	cutSelection,
	deselectAllEntities,
	deselectAllEntitiesOfType,
	deselectNote,
	leaveEditor,
	loadBeatmapEntities,
	mirrorSelection,
	nudgeSelection,
	pasteSelection,
	removeAllSelectedObjects,
	removeFromCell,
	removeNote,
	selectAllEntities,
	selectAllEntitiesInRange,
	selectNote,
	startLoadingMap,
} from "$/store/actions";
import { createActionsForNoteEntityAdapter, createGridObjectSelector, createSelectedEntitiesSelector } from "$/store/helpers";
import { type App, ObjectTool, ObjectType, View } from "$/types";

const adapter = createEntityAdapter<App.IBombNote, EntityId>({
	selectId: resolveNoteId,
	sortComparer: sortObjectFn,
});
const { selectAll, selectTotal } = adapter.getSelectors();
const selectAllSelected = createSelectedEntitiesSelector(selectAll);
const selectByPosition = createGridObjectSelector(selectAll);

const slice = createSlice({
	name: "bombs",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectTotal: selectTotal,
	},
	reducers: (api) => {
		const { updateOne } = createActionsForNoteEntityAdapter(api, adapter);
		return {
			updateOne: updateOne,
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { bombs } = action.payload;
			return adapter.setAll(state, bombs ?? []);
		});
		builder.addCase(addToCell.fulfilled, (state, action) => {
			const { tool: selectedTool, time: beatNum, posX: colIndex, posY: rowIndex } = action.payload;
			if (!selectedTool || selectedTool !== ObjectTool.BOMB_NOTE) return state;
			return adapter.addOne(state, createBombNote({ time: beatNum, posX: colIndex, posY: rowIndex }));
		});
		builder.addCase(removeFromCell.fulfilled, (state, action) => {
			const { time: beatNum, posX: colIndex, posY: rowIndex } = action.payload;
			const match = selectByPosition(state, { time: beatNum, posX: colIndex, posY: rowIndex });
			if (!match) return state;
			return adapter.removeOne(state, adapter.selectId(match));
		});
		builder.addCase(removeAllSelectedObjects, (state) => {
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
			if (!data.bombs) return state;
			const entities = selectAll(state);
			adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
			const timeShiftedEntities = data.bombs.map((x) => ({ ...x, selected: true, time: resolveTimeForItem(x) + deltaBetweenPeriods }));
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
		builder.addCase(deselectAllEntities, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.BEATMAP) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.time >= start - 0.01 && x.time < end } })),
			);
		});
		builder.addCase(mirrorSelection, (state, action) => {
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
		builder.addCase(deselectAllEntitiesOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType !== ObjectType.BOMB) return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addMatcher(isAnyOf(addSong, startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addMatcher(isAnyOf(removeNote, bulkRemoveNote), (state, action) => {
			const { query } = action.payload;
			const match = selectByPosition(state, query);
			if (!match) return state;
			return adapter.removeOne(state, adapter.selectId(match));
		});
		builder.addMatcher(isAnyOf(selectNote, deselectNote), (state, action) => {
			const { query } = action.payload;
			const match = selectByPosition(state, query);
			if (!match) return state;
			const selected = selectNote.match(action);
			return adapter.updateOne(state, { id: adapter.selectId(match), changes: { selected: selected } });
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
