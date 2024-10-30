import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { getBeatNumForItem } from "$/helpers/item.helpers";
import { nudgeObstacles, swapObstacles } from "$/helpers/obstacles.helpers";
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
	selectAll,
	selectAllInRange,
	selectObstacle,
	startLoadingSong,
	swapSelectedNotes,
	toggleFastWallsForSelectedObstacles,
} from "$/store/actions";
import { type App, ObjectType, View } from "$/types";

const initialState = [] as App.Obstacle[];

const slice = createSlice({
	name: "obstacles",
	initialState: initialState,
	selectors: {
		getObstacles: (state) => state,
		getSelectedObstacles: (state) => state.filter((x) => x.selected),
		getNumOfObstacles: (state) => state.length,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (_, action) => {
			const { obstacles } = action.payload;
			return obstacles ?? initialState;
		});
		builder.addCase(createNewObstacle.fulfilled, (state, action) => {
			const { obstacle } = action.payload;
			return [...state, obstacle];
		});
		builder.addCase(resizeObstacle, (state, action) => {
			const { id, newBeatDuration } = action.payload;
			const obstacleIndex = state.findIndex((o) => o.id === id);
			const obstacle = state[obstacleIndex];
			obstacle.beatDuration = newBeatDuration;
		});
		builder.addCase(resizeSelectedObstacles, (state, action) => {
			const { newBeatDuration } = action.payload;
			for (const obstacle of state) {
				if (obstacle.selected) {
					obstacle.beatDuration = newBeatDuration;
				}
			}
		});
		builder.addCase(deleteObstacle, (state, action) => {
			const { id } = action.payload;
			return state.filter((obstacle) => obstacle.id !== id);
		});
		builder.addCase(deleteSelectedNotes, (state) => {
			return state.filter((obstacle) => !obstacle.selected);
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.filter((obstacle) => !obstacle.selected);
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, pasteAtBeat } = action.payload;
			if (view !== View.BEATMAP) return state;
			const isObstacle = (item: object): item is App.Obstacle => "beatStart" in item;
			const earliestBeat = getBeatNumForItem(data[0]);
			const deltaBetweenPeriods = pasteAtBeat - earliestBeat;
			const deselectedState = state.map((obstacle) => ({ ...obstacle, selected: false }));
			const obstacles = data.filter(isObstacle);
			const timeShiftedObstacles = obstacles.map((obstacle) => ({ ...obstacle, selected: true, beatStart: getBeatNumForItem(obstacle) + deltaBetweenPeriods }));
			return [...deselectedState, ...timeShiftedObstacles];
		});
		builder.addCase(selectObstacle, (state, action) => {
			const { id } = action.payload;
			const obstacleIndex = state.findIndex((o) => o.id === id);
			state[obstacleIndex].selected = true;
		});
		builder.addCase(deselectObstacle, (state, action) => {
			const { id } = action.payload;
			const obstacleIndex = state.findIndex((o) => o.id === id);
			state[obstacleIndex].selected = false;
		});
		builder.addCase(selectAll.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.map((obstacle) => ({ ...obstacle, selected: true }));
		});
		builder.addCase(deselectAll, (state, action) => {
			const { view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.map((obstacle) => ({ ...obstacle, selected: false }));
		});
		builder.addCase(selectAllInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.BEATMAP) return state;
			return state.map((obstacle) => {
				const selected = obstacle.beatStart >= start && obstacle.beatStart < end;
				return { ...obstacle, selected };
			});
		});
		builder.addCase(swapSelectedNotes, (state, action) => {
			const { axis } = action.payload;
			return swapObstacles(axis, state);
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.BEATMAP) return state;
			return nudgeObstacles(direction, amount, state);
		});
		builder.addCase(toggleFastWallsForSelectedObstacles, (state) => {
			// This action should either set all walls to "fast", or all walls to "slow" (normal), based on if a single selected map is fast already.
			const areAnySelectedWallsFast = state.some((obstacle) => obstacle.selected && obstacle.fast);
			const shouldBeFast = !areAnySelectedWallsFast;
			return state.map((obstacle) => {
				if (obstacle.selected) return { ...obstacle, fast: shouldBeFast };
				return obstacle;
			});
		});
		builder.addCase(deselectAllOfType, (state, action) => {
			const { itemType } = action.payload;
			if (itemType !== ObjectType.OBSTACLE) return state;
			return state.map((obstacle) => {
				if (!obstacle.selected) return obstacle;
				return { ...obstacle, selected: false };
			});
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong, leaveEditor), () => initialState);
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
