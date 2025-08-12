import { mirrorNoteColor, mirrorNoteDirectionHorizontally, mirrorNoteDirectionVertically } from "bsmap";
import type { wrapper } from "bsmap/types";

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

function isExtendedCoordinate(x: number) {
	return x >= 1000 || x <= -1000;
}
function deserializeCoordinate(x: number) {
	return isExtendedCoordinate(x) ? x / 1000 + (x > 0 ? -1 : 1) : x;
}
function serializeCoordinate(x: number, extensions?: boolean) {
	if (extensions) return (x >= 0 ? x + 1 : x - 1) * 1000;
	return x;
}

export function mirrorCoordinate(coordinate: number, count: number, offset?: number) {
	const value = deserializeCoordinate(coordinate);
	const axis = (count - 1) / 2;
	const mirrored = axis - value + axis + (offset ? 1 - deserializeCoordinate(offset ?? 0) : 0);
	return serializeCoordinate(mirrored, isExtendedCoordinate(coordinate));
}

export function mirrorGridObjectProperties<T extends wrapper.IWrapGridObject>(item: T, axis: "horizontal" | "vertical", grid?: IGrid, offset?: number): Partial<T> {
	return {
		posX: axis === "horizontal" ? mirrorCoordinate(item.posX, DEFAULT_NUM_COLS, offset) : item.posX,
		posY: axis === "vertical" ? mirrorCoordinate(item.posY, grid?.numRows ?? DEFAULT_NUM_ROWS, offset) : item.posY,
	} as Partial<T>;
}

export function mirrorBaseNoteProperties<T extends wrapper.IWrapBaseNote>(item: T, axis: "horizontal" | "vertical"): Partial<T> {
	const resolveDirection = axis === "horizontal" ? mirrorNoteDirectionHorizontally : mirrorNoteDirectionVertically;
	return {
		color: axis === "horizontal" ? mirrorNoteColor(item.color) : item.color,
		direction: resolveDirection(item.direction),
	} as Partial<T>;
}
