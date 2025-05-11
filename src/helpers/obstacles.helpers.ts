import { createObstacle } from "bsmap";

import { type App, ObjectPlacementMode } from "$/types";
import { convertGridColumn, convertGridRow } from "./grid.helpers";

export function resolveObstacleId<T extends Pick<App.IObstacle, "time" | "posX" | "posY" | "width" | "height">>(x: T) {
	return `${x.time}/${x.posX}/${x.width}/${x.posY}/${x.height}`;
}

export function isFullHeightObstacle<T extends Pick<App.IObstacle, "posY" | "height">>({ posY, height }: T) {
	return posY === 0 && height === 5;
}
export function isCrouchObstacle<T extends Pick<App.IObstacle, "posY" | "height">>({ posY, height }: T) {
	return posY === 2 && height === 3;
}
export function isFastObstacle<T extends Pick<App.IObstacle, "duration">>({ duration }: T) {
	return duration < 0;
}

export function isVanillaObstacle<T extends Pick<App.IObstacle, "posY" | "height">>(data: T) {
	return isFullHeightObstacle(data) || isCrouchObstacle(data);
}
export function isExtendedObstacle<T extends Pick<App.IObstacle, "posY" | "height">>(data: T) {
	return !isVanillaObstacle(data);
}

export function toggleFastObstacle<T extends Pick<App.IObstacle, "duration">>({ duration, ...data }: T) {
	return { ...data, duration: duration * -1 } as T;
}

export function createObstacleFromMouseEvent(mode: ObjectPlacementMode, numCols: number, numRows: number, colWidth: number, rowHeight: number, mouseDownAt: { colIndex: number; rowIndex: number } | null, mouseOverAt: { colIndex: number; rowIndex: number } | null, beatDuration = 4) {
	if (!mouseDownAt || !mouseOverAt) throw new Error("Unable to create valid obstacle.");

	const colIndex = Math.min(mouseDownAt.colIndex, mouseOverAt.colIndex);
	const rowIndex = mode === ObjectPlacementMode.EXTENSIONS ? undefined : mouseOverAt.rowIndex === 2 ? 2 : 0;

	// Our colIndex will be a value from 0 to N-1, where N is the num of columns. Eg in an 8-column grid, the number is 0-7.
	// The thing is, I want to store lanes as relative to a 4-column "natural" grid,
	// so column 0 of an 8-column grid should actually be -2 (with a full range of -2 to 5, with 2 before and 2 after the standard 0-3 range).
	const colspan = Math.abs(mouseDownAt.colIndex - mouseOverAt.colIndex) + 1;
	const rowspan = mode === ObjectPlacementMode.EXTENSIONS ? undefined : mouseOverAt.rowIndex === 2 ? 3 : 5;

	const obstacle = createObstacle({
		duration: beatDuration,
		posX: convertGridColumn(colIndex, numCols, colWidth),
		posY: rowIndex,
		height: rowspan,
		width: colspan,
	});

	// 'original' walls need to be clamped, to not cause hazards
	if (mode === ObjectPlacementMode.NORMAL) {
		if (isFullHeightObstacle(obstacle) && obstacle.width > 2) {
			const overBy = obstacle.width - 2;
			obstacle.width = 2;

			const colspanDelta = mouseOverAt.colIndex - mouseDownAt.colIndex;

			if (colspanDelta > 0) {
				obstacle.posX += overBy;
			} else {
				obstacle.posX = mouseOverAt.colIndex;
			}
		}
	} else if (mode === ObjectPlacementMode.EXTENSIONS) {
		// For mapping extensions, things work a little bit differently.
		// We need a rowIndex, which works like `lane`, and rowspan, which works like `colspan`
		const rawRowIndex = Math.min(mouseDownAt.rowIndex, mouseOverAt.rowIndex);

		let lane = convertGridColumn(colIndex, numCols, colWidth);
		let rowIndex = convertGridRow(rawRowIndex, numRows, rowHeight);

		// For completely mystifying reasons, the lanes for obstacles don't scale well with non-standard size cells.
		// I graphed the amount it was off by so that I could use it. No friggin clue why this works but it does.
		const shiftLaneBy = 0.5 * colWidth - 0.5;
		lane -= shiftLaneBy;

		const shiftRowBy = 0.5 * rowHeight - 0.5;
		rowIndex -= shiftRowBy;

		const rowspan = Math.abs(mouseDownAt.rowIndex - mouseOverAt.rowIndex) + 1;

		// while `rowspan` should technically be the number of rows the thing spans, this data is insufficient with Mapping Extensions,
		// where the user can change the height of rows so that an obstacle takes up 1 row but 2 "normal" rows.
		obstacle.height = rowspan * rowHeight;
		// Same thing for columns
		obstacle.width = colspan * colWidth;

		obstacle.posX = lane;
		obstacle.posY = rowIndex;
	}

	return obstacle;
}
