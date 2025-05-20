import { App, type IGrid, ObjectPlacementMode } from "$/types";
import { createBombNote, createColorNote } from "bsmap";
import { convertGridColumn, convertGridRow } from "./grid.helpers";

export function resolveNoteId<T extends Pick<App.IBaseNote, "time" | "posX" | "posY">>(x: T) {
	return `${x.time}/${x.posX}/${x.posY}`;
}
export function resolveNoteColor<T extends Pick<App.IColorNote, "color">>({ color }: T) {
	if (color === -1) throw new Error(`Unsupported color type: ${color}`);
	return Object.values(App.SaberColor)[color];
}
export function resolveNoteDirection<T extends Pick<App.IColorNote, "direction">>({ direction }: T) {
	return Object.values(App.CutDirection)[direction];
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

export function calculateNoteDensity(numOfNotes: number, segmentLengthInBeats: number, bpm: number) {
	if (numOfNotes === 0) {
		return 0;
	}

	const numOfNotesPerBeat = numOfNotes / segmentLengthInBeats;
	const notesPerSecond = numOfNotesPerBeat * (bpm / 60);

	return notesPerSecond;
}
