import { type AsyncThunkPayloadCreator, createEntityAdapter, type EntityId, isAnyOf, type Update } from "@reduxjs/toolkit";
import { createObstacle, sortObjectFn } from "bsmap";
import type { wrapper } from "bsmap/types";

import { mirrorGridObjectProperties, nudgeItem } from "$/helpers/item.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { addObstacle, addSong, cutSelection, deselectAllEntities, deselectAllEntitiesOfType, leaveEditor, loadBeatmapEntities, mirrorSelection, nudgeSelection, pasteSelection, removeAllSelectedObjects, selectAllEntities, selectAllEntitiesInRange, startLoadingMap } from "$/store/actions";
import { createEditorObjectReducers, createEditorObjectSelectors, createSlice } from "$/store/helpers";
import { selectCursorPositionInBeats } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type App, ObjectType, type SongId, View } from "$/types";
import { roundAwayFloatingPointNonsense } from "$/utils";

const adapter = createEntityAdapter<App.IWrapEditorObject<wrapper.IWrapObstacle>, EntityId>({
	selectId: resolveObstacleId,
	sortComparer: sortObjectFn,
});

const { selectAll, selectTotal } = adapter.getSelectors();
const { selectAllSelected } = createEditorObjectSelectors(adapter);

const { removeAllSelected, updateAll, updateAllSelected, replaceAllSelected } = createEditorObjectReducers(adapter);

const slice = createSlice({
	name: "obstacles",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectTotal: selectTotal,
	},
	reducers: (api) => {
		const createFromState: AsyncThunkPayloadCreator<{ obstacle: Partial<wrapper.IWrapObstacle> }, { songId: SongId; obstacle: Partial<wrapper.IWrapObstacle> }> = (args, api) => {
			const state = api.getState() as RootState;
			const cursorPositionInBeats = selectCursorPositionInBeats(state, args.songId);
			if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
			return api.fulfillWithValue({
				obstacle: { ...args.obstacle, time: roundAwayFloatingPointNonsense(cursorPositionInBeats) },
			});
		};

		return {
			addOne: api.asyncThunk(createFromState, {
				fulfilled: (state, action) => {
					const { obstacle: data } = action.payload;
					return adapter.addOne(state, createObstacle(data));
				},
			}),
			updateOne: api.reducer<Update<wrapper.IWrapObstacle, EntityId>>((state, action) => {
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
			updateAllSelected: api.reducer<{ changes: Partial<wrapper.IWrapObstacle> }>((state, action) => {
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
			if (!data.obstacles) return state;
			updateAll(state, () => ({ selected: false }));
			return adapter.upsertMany(
				state,
				data.obstacles.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
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
			if (axis === "vertical") return state;
			return replaceAllSelected(state, (x) => ({ ...mirrorGridObjectProperties(x, axis, grid, 0) }));
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.BEATMAP) return state;
			return updateAllSelected(state, (x) => nudgeItem(x, direction, amount));
		});
		builder.addCase(deselectAllEntitiesOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType !== ObjectType.OBSTACLE) return state;
			return updateAll(state, () => ({ selected: false }));
		});
		builder.addMatcher(isAnyOf(addSong, startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
