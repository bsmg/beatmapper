import { type IWrapBaseNote, type IWrapGridObject, mirrorNoteColor, mirrorNoteDirectionHorizontally, mirrorNoteDirectionVertically } from "bsmap";

import { DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS } from "$/constants";
import type { IGrid } from "$/types";

export function nudgeItem<T extends { time: number }>(direction: "forwards" | "backwards", amount = 1) {
	return (data: T): Partial<T> => {
		return { time: data.time - amount * (direction === "backwards" ? 1 : -1) } as Partial<T>;
	};
}

export function isExtendedCoordinate(x: number) {
	return x >= 1000 || x <= -1000;
}
export function deserializeCoordinate(x: number) {
	return isExtendedCoordinate(x) ? x / 1000 + (x > 0 ? -1 : 1) : x;
}
export function serializeCoordinate(x: number, toExtended?: boolean) {
	return toExtended ? (x >= 0 ? x + 1 : x - 1) * 1000 : x;
}

export function mirrorCoordinate(coordinate: number, count: number, offset?: number) {
	const value = deserializeCoordinate(coordinate);
	const axis = (count - 1) / 2;
	const mirrored = axis - value + axis + (offset ? 1 - deserializeCoordinate(offset ?? 0) : 0);
	return serializeCoordinate(mirrored, isExtendedCoordinate(coordinate));
}

export function mirrorGridObjectProperties<T extends IWrapGridObject>(axis: "horizontal" | "vertical", grid?: IGrid, offset?: number) {
	return (data: T): Partial<T> => {
		return {
			posX: axis === "horizontal" ? mirrorCoordinate(data.posX, DEFAULT_NUM_COLS, offset) : data.posX,
			posY: axis === "vertical" ? mirrorCoordinate(data.posY, grid?.numRows ?? DEFAULT_NUM_ROWS, offset) : data.posY,
		} as Partial<T>;
	};
}
export function mirrorBaseNoteProperties<T extends IWrapBaseNote>(axis: "horizontal" | "vertical") {
	const resolveDirection = axis === "horizontal" ? mirrorNoteDirectionHorizontally : mirrorNoteDirectionVertically;

	return (data: T): Partial<T> => {
		return {
			color: axis === "horizontal" ? mirrorNoteColor(data.color) : data.color,
			direction: resolveDirection(data.direction),
		} as Partial<T>;
	};
}
