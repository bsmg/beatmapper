import { createBombNote, createColorNote, type IWrapBaseNote, type IWrapBombNote, type IWrapColorNote } from "bsmap";

import type { IPlacementContext } from "$/components/scene/layouts/placement-grid/machine";
import { type IGrid, NotePlacementMode } from "$/types";
import { convertGridCell } from "./grid.helpers";
import { serializeCoordinate } from "./item.helpers";

export function isColorNote(data: unknown): data is IWrapColorNote {
	if (typeof data !== "object" || !data) return false;
	return "direction" in data && "angleOffset" in data;
}
export function isBombNote(data: unknown): data is IWrapBombNote {
	if (typeof data !== "object" || !data) return false;
	return "direction" in data;
}

export function resolveNoteId<T extends Pick<IWrapBaseNote, "time" | "posX" | "posY">>(x: T) {
	return `${x.time}/${x.posX}/${x.posY}`;
}

function createNotePlacementFactory<T extends IWrapBaseNote>(createNote: (data: Partial<T>) => T) {
	return ({ cellDownAt }: IPlacementContext, mode: NotePlacementMode, grid: IGrid, data: Partial<T> = {}) => {
		if (!cellDownAt) return null;

		const isExtended = mode === NotePlacementMode.EXTENSIONS;

		const { colIndex, rowIndex } = convertGridCell(cellDownAt, grid);

		return createNote({
			posX: serializeCoordinate(colIndex, isExtended),
			posY: serializeCoordinate(rowIndex, isExtended),
			...data,
		});
	};
}

export const createColorNoteFromMouseEvent = createNotePlacementFactory(createColorNote);
export const createBombNoteFromMouseEvent = createNotePlacementFactory(createBombNote);
