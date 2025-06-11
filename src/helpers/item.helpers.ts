import { type NoteColor, mirrorCoordinate, mirrorNoteColor, mirrorNoteDirectionHorizontally, mirrorNoteDirectionVertically } from "bsmap";

import { DEFAULT_GRID } from "$/constants";
import type { IGrid } from "$/types";

export function resolveTimeForItem<T extends object>(item: T) {
	if ("time" in item && typeof item.time === "number") {
		return item.time;
	}
	throw new Error("Could not determine time for event");
}

export function nudgeItem<T extends { time: number }>(item: T, direction: "forwards" | "backwards", amount = 1) {
	const sign = direction === "backwards" ? 1 : -1;
	return {
		time: item.time - amount * sign,
	} as Partial<T>;
}

export function mirrorItem<T extends { posX?: number; posY?: number; color?: NoteColor; direction?: number }>(item: T, axis: "horizontal" | "vertical", grid: IGrid = DEFAULT_GRID) {
	const resolveDirection = axis === "horizontal" ? mirrorNoteDirectionHorizontally : mirrorNoteDirectionVertically;
	const color = item.color !== undefined ? item.color : undefined;
	const direction = item.direction !== undefined ? item.direction : undefined;
	return {
		posX: axis === "horizontal" && item.posX !== undefined ? mirrorCoordinate(item.posX, grid.numCols) : item.posX,
		posY: axis === "vertical" && item.posY !== undefined ? mirrorCoordinate(item.posY, grid.numRows) : item.posY,
		color: axis === "horizontal" && color !== undefined ? mirrorNoteColor(color) : item.color,
		direction: direction !== undefined ? resolveDirection(direction) : undefined,
	} as Partial<T>;
}
