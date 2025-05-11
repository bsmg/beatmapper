import { type EntityId, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { createObstacle, sortObjectFn } from "bsmap";

import { mirrorItem, nudgeItem, resolveTimeForItem } from "$/helpers/item.helpers";
import { resolveObstacleId, toggleFastObstacle } from "$/helpers/obstacles.helpers";
import {
	createNewObstacle,
	createNewSong,
	cutSelection,
	deleteObstacle,
	deleteSelectedNotes,
	deselectAll,
	deselectAllOfType,
	deselectObstacle,
	leaveEditor,
	loadBeatmapEntities,
	nudgeSelection,
	pasteSelection,
	resizeObstacle,
	resizeSelectedObstacles,
	selectAll as selectAllEntities,
	selectAllInRange,
	selectObstacle,
	startLoadingSong,
	swapSelectedNotes,
	toggleFastWallsForSelectedObstacles,
} from "$/store/actions";
import { createSelectedEntitiesSelector } from "$/store/helpers";
import { type App, ObjectType, View } from "$/types";

const adapter = createEntityAdapter<App.IObstacle, EntityId>({
	selectId: resolveObstacleId,
	sortComparer: sortObjectFn,
});
const { selectAll, selectTotal } = adapter.getSelectors();
const selectAllSelected = createSelectedEntitiesSelector(selectAll);

const slice = createSlice({
	name: "obstacles",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectTotal: selectTotal,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { obstacles } = action.payload;
			return adapter.setAll(state, obstacles ?? []);
		});
		builder.addCase(createNewObstacle.fulfilled, (state, action) => {
			const { obstacle: data } = action.payload;
			return adapter.addOne(state, createObstacle(data));
		});
		builder.addCase(resizeObstacle, (state, action) => {
			const { id, newBeatDuration } = action.payload;
			return adapter.updateOne(state, { id, changes: { duration: newBeatDuration } });
		});
		builder.addCase(resizeSelectedObstacles, (state, action) => {
			const { newBeatDuration } = action.payload;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { duration: newBeatDuration } })),
			);
		});
		builder.addCase(toggleFastWallsForSelectedObstacles, (state) => {
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: toggleFastObstacle(x) })),
			);
		});
		builder.addCase(deleteObstacle, (state, action) => {
			const { id } = action.payload;
			return adapter.removeOne(state, id);
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
			if (!data.obstacles) return state;
			const entities = selectAll(state);
			adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
			const timeShiftedEntities = data.obstacles.map((x) => ({ ...x, selected: true, time: resolveTimeForItem(x) + deltaBetweenPeriods }));
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
			if (axis === "vertical") return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: mirrorItem(x, "horizontal") })),
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
			if (itemType !== ObjectType.OBSTACLE) return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong, leaveEditor), () => adapter.getInitialState());
		builder.addMatcher(isAnyOf(selectObstacle, deselectObstacle), (state, action) => {
			const { id } = action.payload;
			const selected = selectObstacle.match(action);
			return adapter.updateOne(state, { id, changes: { selected: selected } });
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
