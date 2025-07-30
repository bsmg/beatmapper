import { createObstacle } from "bsmap";

import { type App, type IGrid, ObjectPlacementMode } from "$/types";
import { convertGridColumn, convertGridRow } from "./grid.helpers";

export function resolveObstacleId<T extends Pick<App.IObstacle, "time" | "posX" | "posY" | "width" | "height">>(x: T) {
	return `${x.time}/${x.posX}/${x.width}/${x.posY}/${x.height}`;
}

export function isObstacle(data: unknown): data is App.IObstacle {
	if (typeof data !== "object" || !data) return false;
	return "duration" in data;
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

export function createObstacleFromMouseEvent(mode: ObjectPlacementMode, mouseDownAt: { colIndex: number; rowIndex: number }, mouseOverAt: { colIndex: number; rowIndex: number }, { numCols, numRows, colWidth, rowHeight }: IGrid) {
	const rawColIndex = Math.min(mouseDownAt.colIndex, mouseOverAt.colIndex);
	const rawRowIndex = Math.min(mouseDownAt.rowIndex, mouseOverAt.rowIndex);

	// Our colIndex will be a value from 0 to N-1, where N is the num of columns. Eg in an 8-column grid, the number is 0-7.
	// The thing is, I want to store lanes as relative to a 4-column "natural" grid,
	// so column 0 of an 8-column grid should actually be -2 (with a full range of -2 to 5, with 2 before and 2 after the standard 0-3 range).
	const rawWidth = Math.abs(mouseDownAt.colIndex - mouseOverAt.colIndex) + 1;
	const rawHeight = Math.abs(mouseDownAt.rowIndex - mouseOverAt.rowIndex) + 1;

	let colIndex = convertGridColumn(rawColIndex, numCols, colWidth);
	let rowIndex = convertGridRow(rawRowIndex, numRows, rowHeight);

	// lane 0 always spans two cells from the exact center, so we'll calculate the correct serial cell if we're using an extended grid.
	const offset = (numCols - 4) / 2;

	const obstacle = createObstacle({
		posX: colIndex - offset,
		posY: mouseOverAt.rowIndex === 2 ? 2 : 0,
		width: rawWidth,
		height: mouseOverAt.rowIndex === 2 ? 3 : 5,
	});

	switch (mode) {
		case ObjectPlacementMode.NORMAL: {
			// 'original' walls need to be clamped to not cause hazards
			if (isFullHeightObstacle(obstacle)) {
				const downAt = mouseDownAt.colIndex - offset;
				const overAt = mouseOverAt.colIndex - offset;
				// these values will be known since the center of the grid will always be located between lanes 1 and 2.
				if (!((downAt < 2 && overAt > 1) || (downAt > 1 && overAt < 2))) return obstacle;

				const half = Math.round(numCols / 2);

				obstacle.width = rawWidth - half;

				// use the delta to determine whether we're moving from left-to-right or right-to-left
				if (mouseOverAt.colIndex >= half) {
					obstacle.posX = half - offset;
					obstacle.width += mouseDownAt.colIndex;
				} else {
					obstacle.posX = mouseOverAt.colIndex - offset;
					obstacle.width += numCols - 1 - mouseDownAt.colIndex;
				}
			}
			return obstacle;
		}
		case ObjectPlacementMode.EXTENSIONS: {
			// For completely mystifying reasons, the lanes for obstacles don't scale well with non-standard size cells.
			// I graphed the amount it was off by so that I could use it. No friggin clue why this works but it does.
			const shiftLaneBy = 0.5 * colWidth - 0.5;
			colIndex -= shiftLaneBy;

			const shiftRowBy = 0.5 * rowHeight - 0.5;
			rowIndex -= shiftRowBy;

			// while `rowspan` should technically be the number of rows the thing spans, this data is insufficient with Mapping Extensions,
			// where the user can change the height of rows so that an obstacle takes up 1 row but 2 "normal" rows.
			const newHeight = rawHeight * rowHeight;
			// Same thing for columns
			const newWidth = rawWidth * colWidth;

			// we need to convert the values to their mapping extensions equivalents
			obstacle.width = (newWidth + 1) * 1000;
			obstacle.height = (newHeight + 1) * 1000;

			obstacle.posX = colIndex >= 0 ? (colIndex + 1) * 1000 : (colIndex - 1) * 1000;
			obstacle.posY = rowIndex >= 0 ? (rowIndex + 1) * 1000 : (rowIndex - 1) * 1000;

			// hack: the base of an obstacle sits below the base of a note, so we'll apply an offset for placements to make up the difference with the visual grid
			obstacle.posY += 500;

			return obstacle;
		}
	}
}
