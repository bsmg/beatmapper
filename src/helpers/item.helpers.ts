import { DEFAULT_GRID } from "$/constants";
import { App, CutDirection, type IGrid } from "$/types";
import { cycle } from "$/utils";

export function resolveBeatForItem<T extends object>(item: T) {
	if ("_time" in item && typeof item._time === "number") {
		return item._time;
	}
	if ("beatStart" in item && typeof item.beatStart === "number") {
		return item.beatStart;
	}
	if ("beatNum" in item && typeof item.beatNum === "number") {
		return item.beatNum;
	}
	throw new Error("Could not determine time for event");
}

export function sortByTime<T extends object>(a: T, b: T) {
	const aBeatNum = resolveBeatForItem(a);
	const bBeatNum = resolveBeatForItem(b);
	return aBeatNum - bBeatNum;
}

export function nudgeItem<T extends { beatNum: number }>(item: T, direction: "forwards" | "backwards", amount = 1) {
	const sign = direction === "backwards" ? 1 : -1;
	return {
		beatNum: item.beatNum - amount * sign,
	} as Partial<T>;
}

function getHorizontallyFlippedCutDirection(cutDirection: CutDirection) {
	//  4 0 5
	//  2 8 3
	//  6 1 7
	switch (cutDirection) {
		case CutDirection.UP:
		case CutDirection.ANY:
		case CutDirection.DOWN: {
			return cutDirection;
		}
		case CutDirection.UP_LEFT:
		case CutDirection.LEFT:
		case CutDirection.DOWN_LEFT: {
			return cutDirection + 1;
		}
		case CutDirection.UP_RIGHT:
		case CutDirection.RIGHT:
		case CutDirection.DOWN_RIGHT: {
			return cutDirection - 1;
		}
		default: {
			throw new Error(`Unrecognized cut direction: ${cutDirection}`);
		}
	}
}
function getVerticallyFlippedCutDirection(cutDirection: CutDirection) {
	//  4 0 5
	//  2 8 3
	//  6 1 7
	switch (cutDirection) {
		case CutDirection.LEFT:
		case CutDirection.ANY:
		case CutDirection.RIGHT: {
			return cutDirection;
		}
		case CutDirection.UP_LEFT:
		case CutDirection.UP_RIGHT: {
			return cutDirection + 2;
		}
		case CutDirection.UP: {
			return cutDirection + 1;
		}
		case CutDirection.DOWN: {
			return cutDirection - 1;
		}
		case CutDirection.DOWN_LEFT:
		case CutDirection.DOWN_RIGHT: {
			return cutDirection - 2;
		}
		default: {
			throw new Error(`Unrecognized cut direction: ${cutDirection}`);
		}
	}
}
export function mirrorItem<T extends { colIndex?: number; rowIndex?: number; color?: App.SaberColor; direction?: App.CutDirection }>(item: T, axis: "horizontal" | "vertical", grid: IGrid = DEFAULT_GRID) {
	const resolveDirection = axis === "horizontal" ? getHorizontallyFlippedCutDirection : getVerticallyFlippedCutDirection;
	const direction = item.direction !== undefined ? Object.values(CutDirection)[Object.values(App.CutDirection).indexOf(item.direction)] : undefined;
	return {
		colIndex: axis === "horizontal" && item.colIndex !== undefined ? grid.numCols - 1 - item.colIndex : item.colIndex,
		rowIndex: axis === "vertical" && item.rowIndex !== undefined ? grid.numRows - 1 - item.rowIndex : item.rowIndex,
		color: axis === "horizontal" && item.color !== undefined ? cycle(Object.values(App.SaberColor), item.color) : item.color,
		direction: direction !== undefined ? Object.values(App.CutDirection)[Object.values<number>(CutDirection).indexOf(resolveDirection(direction))] : undefined,
	} as Partial<T>;
}
