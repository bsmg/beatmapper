import { nanoid } from "nanoid";

import { DEFAULT_NUM_COLS } from "$/constants";
import { App, type Json, ObjectPlacementMode } from "$/types";
import { ObstacleType } from "$/types/beatmap/app";
import { clamp, normalize, roundToNearest } from "$/utils";
import { convertGridColumn, convertGridRow } from "./grid.helpers";

// These constants relate to the conversion to/from MappingExtensions obstacles.
const FULL_WALL_HEIGHT_IN_ROWS = 5;
const WALL_HEIGHT_MIN = 0;
const WALL_HEIGHT_MAX = 1000;

const WALL_START_BASE = 100;
const WALL_START_MAX = 400;

const RIDICULOUS_MAP_EX_CONSTANT = 4001;

export function isExtendedObstacle(obstacle: App.Obstacle): obstacle is App.IExtensionObstacle {
	return obstacle.type === ObstacleType.EXTENDED;
}

export function convertObstaclesToRedux<T extends Json.Obstacle>(obstacles: T[], gridCols = DEFAULT_NUM_COLS): App.Obstacle[] {
	return obstacles.map((o) => {
		const obstacleData = {} as App.Obstacle;
		if (o._type <= 1) {
			obstacleData.type = o._type === 0 ? App.ObstacleType.FULL : App.ObstacleType.TOP;

			// We want to truncate widths that fall outside the acceptable parameters (4 columns).
			let truncatedColspan = o._width;
			if (truncatedColspan + o._lineIndex > 4) {
				truncatedColspan = 4 - o._lineIndex;
			}

			obstacleData.colspan = truncatedColspan;
		} else {
			// If this is a Mapping Extension map, we have some extra work to do.
			// Annoyingly, the 'type' field conveys information about BOTH the wall  height, and the wall Y offset.
			const typeValue = o._type - RIDICULOUS_MAP_EX_CONSTANT;
			const wallHeight = Math.round(typeValue / 1000);
			const wallStartHeight = typeValue % 1000;

			const rowspan = roundToNearest(normalize(wallHeight, WALL_HEIGHT_MIN, WALL_HEIGHT_MAX, 0, FULL_WALL_HEIGHT_IN_ROWS), 0.001);

			const rowIndex = roundToNearest(normalize(wallStartHeight, WALL_START_BASE, WALL_START_MAX, 0, 2), 0.01);

			obstacleData.type = App.ObstacleType.EXTENDED;
			if (isExtendedObstacle(obstacleData)) {
				obstacleData.rowspan = rowspan;
				obstacleData.rowIndex = rowIndex;
				obstacleData.colIndex = o._lineIndex < 0 ? o._lineIndex / 1000 + 1 : o._lineIndex / 1000 - 1;
				obstacleData.colspan = (o._width - 1000) / 1000;
			}
		}

		let duration = o._duration;
		if (duration < 0) {
			duration = Math.abs(duration);
			obstacleData.fast = true;
		}

		return {
			...obstacleData,
			id: nanoid(),
			beatNum: o._time,
			beatDuration: duration,
			colIndex: obstacleData.colIndex ?? o._lineIndex,
		} as App.Obstacle;
	});
}

export function convertObstaclesToExportableJson<T extends App.Obstacle>(obstacles: T[], gridCols = DEFAULT_NUM_COLS): Json.Obstacle[] {
	return obstacles.map((o, i) => {
		// Normally, type is either 0 or 1, for walls or ceilings. With Mapping Extensions, type is used to control both height and y position @_@
		// We can tell if we're managing a MapEx wall by the `type`. It works according to this formula:
		//    wallHeight * 1000 + startHeight + 4001
		const obstacleData = {} as Json.Obstacle;

		switch (o.type) {
			case App.ObstacleType.FULL: {
				obstacleData._type = 0;
				obstacleData._lineIndex = o.colIndex;
				obstacleData._width = o.colspan;
				break;
			}
			case App.ObstacleType.TOP: {
				obstacleData._type = 1;
				obstacleData._lineIndex = o.colIndex;
				obstacleData._width = o.colspan;
				break;
			}
			case App.ObstacleType.EXTENDED: {
				if (!isExtendedObstacle(o)) break;
				// `wallHeight` is a value from 0 to 4000:
				// - 0 is flat
				// - 1000 is normal height (which I think is like 4 rows?)
				// - 4000 is max
				let normalizedWallHeight = Math.round(normalize(o.rowspan, 0, FULL_WALL_HEIGHT_IN_ROWS, WALL_HEIGHT_MIN, WALL_HEIGHT_MAX));
				normalizedWallHeight = clamp(normalizedWallHeight, 0, 4000);

				// Wall start height is a number between 0 and 999. A wall start height of 0 means the bottom of the wall is on the platform. A wall start height of 1000 is on the first cell.
				let normalizedWallStart = Math.round(normalize(o.rowIndex, 0, 2, WALL_START_BASE, WALL_START_MAX));
				normalizedWallStart = clamp(normalizedWallStart, 0, 999);

				obstacleData._type = normalizedWallHeight * 1000 + normalizedWallStart + RIDICULOUS_MAP_EX_CONSTANT;

				// Lanes are values from 0-3 in a standard 4-column grid, but they could be lower or higher than that in a larger grid (eg. in an 8-col grid, the range is -2 through 5).
				// As with notes, we need to convert them to the thousands-scale used by MappingExtensions.
				obstacleData._lineIndex = Math.round(o.colIndex < 0 ? o.colIndex * 1000 - 1000 : o.colIndex * 1000 + 1000);

				obstacleData._width = Math.round(o.colspan * 1000 + 1000);

				break;
			}

			default: {
				// @ts-expect-error
				throw new Error(`Unrecognized type: ${o.type}`);
			}
		}

		let duration = o.beatDuration;
		if (o.fast) {
			duration *= -1;
		}
		// Obstacles need to be at least 1/100th of a beat to be visible. Stealing this from MediocreMapper
		if (Math.abs(duration) === 0) {
			duration = 0.01;
		}

		const data = {
			...obstacleData,
			_time: o.beatNum,
			_duration: duration,
		} as Json.Obstacle;

		return data;
	});
}

export function swapObstacles<T extends App.Obstacle>(axis: "horizontal" | "vertical", obstacles: T[]) {
	// There is no vertical equivalent to ceiling obstacles. So, no work is necessary
	if (axis === "vertical") {
		return obstacles;
	}

	return obstacles.map((obstacle) => {
		if (!obstacle.selected) {
			return obstacle;
		}

		return {
			...obstacle,
			colIndex: 3 - obstacle.colIndex,
		};
	});
}

export function nudgeObstacles<T extends App.Obstacle>(direction: "forwards" | "backwards", amount: number, obstacles: T[]) {
	const sign = direction === "forwards" ? 1 : -1;

	return obstacles.map((obstacle) => {
		if (!obstacle.selected) {
			return obstacle;
		}

		return {
			...obstacle,
			beatNum: obstacle.beatNum + amount * sign,
		};
	});
}

export function createObstacleFromMouseEvent(mode: ObjectPlacementMode, numCols: number, numRows: number, colWidth: number, rowHeight: number, mouseDownAt: { colIndex: number; rowIndex: number }, mouseOverAt: { colIndex: number; rowIndex: number }, beatDuration = 4) {
	const laneIndex = Math.min(mouseDownAt.colIndex, mouseOverAt.colIndex);

	// Our colIndex will be a value from 0 to N-1, where N is the num of columns. Eg in an 8-column grid, the number is 0-7.
	// The thing is, I want to store lanes as relative to a 4-column "natural" grid,
	// so column 0 of an 8-column grid should actually be -2 (with a full range of -2 to 5, with 2 before and 2 after the standard 0-3 range).
	const colspan = Math.abs(mouseDownAt.colIndex - mouseOverAt.colIndex) + 1;

	const obstacleType = mode === ObjectPlacementMode.EXTENSIONS ? App.ObstacleType.EXTENDED : mouseOverAt.rowIndex === 2 ? App.ObstacleType.TOP : App.ObstacleType.FULL;

	const obstacle = {
		type: obstacleType,
		beatDuration,
		colspan,
	} as App.Obstacle;

	// 'original' walls need to be clamped, to not cause hazards
	if (mode === ObjectPlacementMode.NORMAL) {
		const lane = convertGridColumn(laneIndex, numCols, colWidth);
		obstacle.colIndex = lane;

		if (obstacle.type === App.ObstacleType.FULL && obstacle.colspan > 2) {
			const overBy = obstacle.colspan - 2;
			obstacle.colspan = 2;

			const colspanDelta = mouseOverAt.colIndex - mouseDownAt.colIndex;

			if (colspanDelta > 0) {
				obstacle.colIndex += overBy;
			} else {
				obstacle.colIndex = mouseOverAt.colIndex;
			}
		}
	} else if (mode === ObjectPlacementMode.EXTENSIONS) {
		if (!isExtendedObstacle(obstacle)) return obstacle;
		// For mapping extensions, things work a little bit differently.
		// We need a rowIndex, which works like `lane`, and rowspan, which works like `colspan`
		const rawRowIndex = Math.min(mouseDownAt.rowIndex, mouseOverAt.rowIndex);

		let lane = convertGridColumn(laneIndex, numCols, colWidth);
		let rowIndex = convertGridRow(rawRowIndex, numRows, rowHeight);

		// For completely mystifying reasons, the lanes for obstacles don't scale well with non-standard size cells.
		// I graphed the amount it was off by so that I could use it. No friggin clue why this works but it does.
		const shiftLaneBy = 0.5 * colWidth - 0.5;
		lane -= shiftLaneBy;

		const shiftRowBy = 0.5 * rowHeight - 0.5;
		rowIndex -= shiftRowBy;

		const rowspan = Math.abs(mouseDownAt.rowIndex - mouseOverAt.rowIndex) + 1;

		// while `rowspan` should technically be the number of rows the thing spans, this data is insufficient with Mapping Extensions,
		// where the user can change the height of rows so that an obstacle takes up 1 row but 2 "normal" rows.
		obstacle.rowspan = rowspan * rowHeight;
		// Same thing for columns
		obstacle.colspan = colspan * colWidth;

		obstacle.colIndex = lane;
		obstacle.rowIndex = rowIndex;
	}

	return obstacle;
}
