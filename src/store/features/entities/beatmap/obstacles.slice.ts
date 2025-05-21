import { type AsyncThunkPayloadCreator, type EntityId, type Update, createEntityAdapter, isAnyOf } from "@reduxjs/toolkit";
import { createObstacle, sortObjectFn } from "bsmap";

import { mirrorItem, nudgeItem, resolveTimeForItem } from "$/helpers/item.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { addObstacle, addSong, cutSelection, deselectAllEntities, deselectAllEntitiesOfType, leaveEditor, loadBeatmapEntities, mirrorSelection, nudgeSelection, pasteSelection, removeAllSelectedObjects, selectAllEntities, selectAllEntitiesInRange, startLoadingMap } from "$/store/actions";
import { createSelectedEntitiesSelector, createSlice } from "$/store/helpers";
import { selectCursorPositionInBeats } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type App, ObjectType, type SongId, View } from "$/types";
import { roundAwayFloatingPointNonsense } from "$/utils";

const adapter = createEntityAdapter<App.IObstacle, EntityId>({
	selectId: resolveObstacleId,
	sortComparer: sortObjectFn,
});
const { selectAll, selectTotal } = adapter.getSelectors();
const selectAllSelected = createSelectedEntitiesSelector(selectAll);

const createFromState: AsyncThunkPayloadCreator<{ obstacle: Partial<App.IObstacle> }, { songId: SongId; obstacle: Partial<App.IObstacle> }> = (args, api) => {
	const state = api.getState() as RootState;
	let cursorPositionInBeats = selectCursorPositionInBeats(state, args.songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	cursorPositionInBeats = roundAwayFloatingPointNonsense(cursorPositionInBeats);
	return api.fulfillWithValue({
		obstacle: {
			...args.obstacle,
			time: cursorPositionInBeats,
		} as Omit<App.IObstacle, "id">,
	});
};

const slice = createSlice({
	name: "obstacles",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectTotal: selectTotal,
	},
	reducers: (api) => {
		return {
			addOne: api.asyncThunk(createFromState, {
				fulfilled: (state, action) => {
					const { obstacle: data } = action.payload;
					return adapter.addOne(state, createObstacle(data));
				},
			}),
			updateOne: api.reducer<Update<App.IObstacle, EntityId>>((state, action) => {
				return adapter.updateOne(state, action.payload);
			}),
			selectOne: api.reducer<{ id: EntityId }>((state, action) => {
				const { id } = action.payload;
				return adapter.updateOne(state, { id, changes: { selected: true } });
			}),
			deselectOne: api.reducer<{ id: EntityId }>((state, action) => {
				const { id } = action.payload;
				return adapter.updateOne(state, { id, changes: { selected: false } });
			}),
			updateAllSelected: api.reducer<{ changes: Partial<App.IObstacle> }>((state, action) => {
				const { changes } = action.payload;
				const entities = selectAllSelected(state);
				return adapter.updateMany(
					state,
					entities.map((x) => ({ id: adapter.selectId(x), changes })),
				);
			}),
			removeOne: api.reducer<{ id: EntityId }>((state, action) => {
				return adapter.removeOne(state, action.payload.id);
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { obstacles } = action.payload;
			return adapter.setAll(state, obstacles ?? []);
		});
		builder.addCase(addObstacle.fulfilled, (state, action) => {
			const { obstacle: data } = action.payload;
			return adapter.addOne(state, createObstacle(data));
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
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.time >= start && x.time < end } })),
			);
		});
		builder.addCase(mirrorSelection, (state, action) => {
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
		builder.addCase(deselectAllEntitiesOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType !== ObjectType.OBSTACLE) return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addMatcher(isAnyOf(addSong, startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
