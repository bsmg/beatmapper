import { mirrorNoteColor, mirrorNoteDirectionHorizontally, mirrorNoteDirectionVertically, type NoteColor } from "bsmap";

import { DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS } from "$/constants";
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

function mirrorCoordinate(coordinate: number, count: number, offset?: number) {
	const fromExtended = (x: number) => (x >= 1000 || x <= -1000 ? x / 1000 + (x > 0 ? -1 : 1) : x);
	const value = fromExtended(coordinate);
	const axis = (count - 1) / 2;
	const mirrored = axis - value + axis + (offset ? 1 - fromExtended(offset ?? 0) : 0);
	return (mirrored >= 0 ? mirrored + 1 : mirrored - 1) * 1000;
}

export function mirrorItem<T extends { posX?: number; posY?: number; color?: NoteColor; direction?: number }>(item: T, axis: "horizontal" | "vertical", grid?: IGrid, offset?: number) {
	const resolveDirection = axis === "horizontal" ? mirrorNoteDirectionHorizontally : mirrorNoteDirectionVertically;
	const color = item.color !== undefined ? item.color : undefined;
	const direction = item.direction !== undefined ? item.direction : undefined;
	return {
		posX: axis === "horizontal" && item.posX !== undefined ? mirrorCoordinate(item.posX, DEFAULT_NUM_COLS, offset) : item.posX,
		posY: axis === "vertical" && item.posY !== undefined ? mirrorCoordinate(item.posY, grid?.numRows ?? DEFAULT_NUM_ROWS, offset) : item.posY,
		color: axis === "horizontal" && color !== undefined ? mirrorNoteColor(color) : item.color,
		direction: direction !== undefined ? resolveDirection(direction) : undefined,
	} as Partial<T>;
}
