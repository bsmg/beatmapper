import { createEntityAdapter, createSlice, type EntityId, isAnyOf } from "@reduxjs/toolkit";
import { createColorNote, mirrorNoteColor, sortObjectFn } from "bsmap";
import type { wrapper } from "bsmap/types";

import { mirrorBaseNoteProperties, mirrorGridObjectProperties, nudgeItem } from "$/helpers/item.helpers";
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
import { createEditorObjectReducers, createEditorObjectSelectors, createGridObjectReducerFactory } from "$/store/helpers";
import { type App, ObjectTool, ObjectType, View } from "$/types";

const adapter = createEntityAdapter<App.IWrapEditorObject<wrapper.IWrapColorNote>, EntityId>({
	selectId: resolveNoteId,
	sortComparer: sortObjectFn,
});

const { selectAll, selectTotal } = adapter.getSelectors();
const { selectAllSelected } = createEditorObjectSelectors(adapter);
const { removeAllSelected, updateAll, updateAllSelected, replaceAllSelected } = createEditorObjectReducers(adapter);

const createNoteReducer = createGridObjectReducerFactory(adapter);

const slice = createSlice({
	name: "notes",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectTotal: selectTotal,
	},
	reducers: {
		updateOne: createNoteReducer<{ changes: Partial<wrapper.IWrapColorNote> }>((data, state, action) => {
			return adapter.updateOne(state, { id: adapter.selectId(data), changes: action.payload.changes });
		}),
		mirrorOne: createNoteReducer((data, state) => {
			return adapter.updateOne(state, { id: adapter.selectId(data), changes: { color: mirrorNoteColor(data.color) } });
		}),
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { notes } = action.payload;
			return adapter.setAll(state, notes ?? []);
		});
		builder.addCase(addToCell.fulfilled, (state, action) => {
			const { query, tool: selectedTool, direction } = action.payload;
			if (!selectedTool || (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE)) return state;
			const color = Object.values(ObjectTool).indexOf(selectedTool) as 0 | 1;
			return adapter.upsertOne(state, createColorNote({ ...query, color: color, direction: direction }));
		});
		builder.addCase(
			removeFromCell.fulfilled,
			createNoteReducer((match, state) => {
				return adapter.removeOne(state, adapter.selectId(match));
			}),
		);
		builder.addCase(removeAllSelectedObjects, (state) => {
			return removeAllSelected(state);
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return removeAllSelected(state);
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, deltaBetweenPeriods } = action.payload;
			if (view !== View.BEATMAP) return state;
			if (!data.notes) return state;
			updateAll(state, () => ({ selected: false }));
			return adapter.upsertMany(
				state,
				data.notes.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
			);
		});
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return updateAll(state, () => ({ selected: true }));
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return updateAll(state, () => ({ selected: false }));
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return updateAll(state, (x) => ({ selected: x.time >= start - 0.01 && x.time < end }));
		});
		builder.addCase(mirrorSelection, (state, action) => {
			const { axis, grid } = action.payload;
			return replaceAllSelected(state, (x) => ({ ...mirrorGridObjectProperties(x, axis, grid, 0), ...mirrorBaseNoteProperties(x, axis) }));
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.BEATMAP) return state;
			return updateAllSelected(state, (x) => nudgeItem(x, direction, amount));
		});
		builder.addCase(deselectAllEntitiesOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType !== ObjectType.NOTE) return state;
			return updateAll(state, () => ({ selected: false }));
		});
		builder.addMatcher(isAnyOf(addSong, startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addMatcher(
			isAnyOf(removeNote, bulkRemoveNote),
			createNoteReducer((match, state) => {
				return adapter.removeOne(state, adapter.selectId(match));
			}),
		);
		builder.addMatcher(
			isAnyOf(selectNote, deselectNote),
			createNoteReducer((match, state, action) => {
				return adapter.updateOne(state, { id: adapter.selectId(match), changes: { selected: selectNote.match(action) } });
			}),
		);
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
