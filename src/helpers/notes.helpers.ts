import { createBombNote, createColorNote, NoteDirection } from "bsmap";
import type { wrapper } from "bsmap/types";

import type { IPlacementContext } from "$/components/scene/layouts/placement-grid/machine";
import { type App, type IGrid, ObjectPlacementMode } from "$/types";
import { convertGridCell } from "./grid.helpers";

export function resolveNoteId<T extends Pick<App.IBaseNote, "time" | "posX" | "posY">>(x: T) {
	return `${x.time}/${x.posX}/${x.posY}`;
}

export function isColorNote(data: unknown): data is App.IColorNote {
	if (typeof data !== "object" || !data) return false;
	return "direction" in data && "angleOffset" in data;
}
export function isBombNote(data: unknown): data is App.IBombNote {
	if (typeof data !== "object" || !data) return false;
	return "direction" in data;
}

export function createColorNoteFromMouseEvent({ cellDownAt, direction }: IPlacementContext, mode: ObjectPlacementMode, { numCols, numRows, colWidth, rowHeight }: IGrid, data?: Partial<wrapper.IWrapColorNote>) {
	if (!cellDownAt) return null;

	const note = createColorNote({
		posX: cellDownAt.colIndex,
		posY: cellDownAt.rowIndex,
		direction: direction ?? NoteDirection.ANY,
		...data,
	});

	switch (mode) {
		case ObjectPlacementMode.NORMAL: {
			return note;
		}
		case ObjectPlacementMode.EXTENSIONS: {
			const { colIndex, rowIndex } = convertGridCell(cellDownAt, { numCols, colWidth, numRows, rowHeight });

			note.posX = colIndex >= 0 ? (colIndex + 1) * 1000 : (colIndex - 1) * 1000;
			note.posY = rowIndex >= 0 ? (rowIndex + 1) * 1000 : (rowIndex - 1) * 1000;

			return note;
		}
	}
}
export function createBombNoteFromMouseEvent({ cellDownAt }: IPlacementContext, mode: ObjectPlacementMode, { numCols, numRows, colWidth, rowHeight }: IGrid, data?: Partial<wrapper.IWrapBombNote>) {
	if (!cellDownAt) return null;

	const note = createBombNote({
		posX: cellDownAt.colIndex,
		posY: cellDownAt.rowIndex,
		...data,
	});

	switch (mode) {
		case ObjectPlacementMode.NORMAL: {
			return note;
		}
		case ObjectPlacementMode.EXTENSIONS: {
			const { colIndex, rowIndex } = convertGridCell(cellDownAt, { numCols, colWidth, numRows, rowHeight });

			note.posX = colIndex >= 0 ? (colIndex + 1) * 1000 : (colIndex - 1) * 1000;
			note.posY = rowIndex >= 0 ? (rowIndex + 1) * 1000 : (rowIndex - 1) * 1000;

			return note;
		}
	}
}
