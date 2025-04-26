import { NoteColor, NoteDirection, mirrorCoordinate, mirrorNoteColor, mirrorNoteDirectionHorizontally, mirrorNoteDirectionVertically } from "bsmap";

import { DEFAULT_GRID } from "$/constants";
import { App, type IGrid } from "$/types";

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

export function sortByBeat<T extends object>(a: T, b: T) {
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

const APP_SABER_COLORS = Object.values(App.SaberColor);
const APP_CUT_DIRECTIONS = Object.values(App.CutDirection);

const BS_CUT_DIRECTIONS = Object.values(NoteDirection);
const BS_SABER_COLORS = Object.values(NoteColor).slice(1);

export function mirrorItem<T extends { colIndex?: number; rowIndex?: number; color?: App.SaberColor; direction?: App.CutDirection }>(item: T, axis: "horizontal" | "vertical", grid: IGrid = DEFAULT_GRID) {
	const resolveDirection = axis === "horizontal" ? mirrorNoteDirectionHorizontally : mirrorNoteDirectionVertically;
	const color = item.color !== undefined ? BS_SABER_COLORS[APP_SABER_COLORS.indexOf(item.color)] : undefined;
	const direction = item.direction !== undefined ? BS_CUT_DIRECTIONS[APP_CUT_DIRECTIONS.indexOf(item.direction)] : undefined;
	return {
		colIndex: axis === "horizontal" && item.colIndex !== undefined ? mirrorCoordinate(item.colIndex, grid.numCols) : item.colIndex,
		rowIndex: axis === "vertical" && item.rowIndex !== undefined ? mirrorCoordinate(item.rowIndex, grid.numRows) : item.rowIndex,
		color: axis === "horizontal" && color !== undefined ? APP_SABER_COLORS[BS_SABER_COLORS.indexOf(mirrorNoteColor(color))] : item.color,
		direction: direction !== undefined ? APP_CUT_DIRECTIONS[BS_CUT_DIRECTIONS.indexOf(resolveDirection(direction))] : undefined,
	} as Partial<T>;
}
