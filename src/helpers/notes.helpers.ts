import { createBombNote, createColorNote } from "bsmap";

import { type App, type IGrid, ObjectPlacementMode } from "$/types";
import { convertGridColumn, convertGridRow } from "./grid.helpers";

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

export function createColorNoteFromMouseEvent(mode: ObjectPlacementMode, mouseDownAt: { colIndex: number; rowIndex: number }, { numCols, numRows, colWidth, rowHeight }: IGrid, direction: number) {
	const note = createColorNote({
		posX: mouseDownAt.colIndex,
		posY: mouseDownAt.rowIndex,
		direction: direction,
	});

	switch (mode) {
		case ObjectPlacementMode.NORMAL: {
			return note;
		}
		case ObjectPlacementMode.EXTENSIONS: {
			const colIndex = convertGridColumn(mouseDownAt.colIndex, numCols, colWidth);
			const rowIndex = convertGridRow(mouseDownAt.rowIndex, numRows, rowHeight);

			note.posX = colIndex >= 0 ? (colIndex + 1) * 1000 : (colIndex - 1) * 1000;
			note.posY = rowIndex >= 0 ? (rowIndex + 1) * 1000 : (rowIndex - 1) * 1000;

			return note;
		}
	}
}
export function createBombNoteFromMouseEvent(mode: ObjectPlacementMode, mouseDownAt: { colIndex: number; rowIndex: number }, { numCols, numRows, colWidth, rowHeight }: IGrid) {
	const note = createBombNote({
		posX: mouseDownAt.colIndex,
		posY: mouseDownAt.rowIndex,
	});

	switch (mode) {
		case ObjectPlacementMode.NORMAL: {
			return note;
		}
		case ObjectPlacementMode.EXTENSIONS: {
			const colIndex = convertGridColumn(mouseDownAt.colIndex, numCols, colWidth);
			const rowIndex = convertGridRow(mouseDownAt.rowIndex, numRows, rowHeight);

			note.posX = colIndex >= 0 ? (colIndex + 1) * 1000 : (colIndex - 1) * 1000;
			note.posY = rowIndex >= 0 ? (rowIndex + 1) * 1000 : (rowIndex - 1) * 1000;

			return note;
		}
	}
}
