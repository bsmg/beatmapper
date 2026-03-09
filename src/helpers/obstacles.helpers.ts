import { createObstacle } from "bsmap";
import type { wrapper } from "bsmap/types";

import type { IPlacementContext } from "$/components/scene/layouts/placement-grid/machine";
import { type IGrid, ObstaclePlacementMode } from "$/types";
import { convertGridCell } from "./grid.helpers";
import { serializeCoordinate } from "./item.helpers";

export function isObstacle(data: unknown): data is wrapper.IWrapObstacle {
	if (typeof data !== "object" || !data) return false;
	return "duration" in data;
}

export function resolveObstacleId<T extends Pick<wrapper.IWrapObstacle, "time" | "posX" | "posY" | "width" | "height">>(x: T) {
	return `${x.time}/${x.posX}/${x.width}/${x.posY}/${x.height}`;
}

export function isDodgeObstacle<T extends Pick<wrapper.IWrapObstacle, "posY" | "height">>({ posY, height }: T) {
	return posY < 2 && posY + height > 1;
}
export function isFastObstacle<T extends Pick<wrapper.IWrapObstacle, "duration">>({ duration }: T) {
	return duration < 0;
}

function clampObstacle<T extends Pick<wrapper.IWrapObstacle, "posX" | "posY" | "width" | "height">>(obstacle: T, rawWidth: number, { cellDownAt, cellOverAt }: Required<Pick<{ [key in keyof IPlacementContext]: NonNullable<IPlacementContext[key]> }, "cellDownAt" | "cellOverAt">>, { numCols }: Pick<IGrid, "numCols">) {
	const offset = (numCols - 4) / 2;
	const half = Math.round(numCols / 2);

	if (isDodgeObstacle(obstacle)) {
		const downAt = cellDownAt.colIndex - offset;
		const overAt = cellOverAt.colIndex - offset;

		if (!((downAt < 2 && overAt > 1) || (downAt > 1 && overAt < 2))) {
			return obstacle;
		}

		obstacle.width = rawWidth - half;

		if (cellOverAt.colIndex >= half) {
			obstacle.posX = half - offset;
			obstacle.width += cellDownAt.colIndex;
		} else {
			obstacle.posX = cellOverAt.colIndex - offset;
			obstacle.width += numCols - 1 - cellDownAt.colIndex;
		}
	}

	return obstacle;
}

export function createObstacleFromMouseEvent({ cellDownAt, cellOverAt }: IPlacementContext, mode: ObstaclePlacementMode, { numCols, numRows, colWidth, rowHeight, colOffset, rowOffset }: IGrid, data: Partial<wrapper.IWrapObstacle>) {
	if (!cellDownAt || !cellOverAt) return null;

	// 1. Determine the raw bounding box from the mouse event
	const minColIndex = Math.min(cellDownAt.colIndex, cellOverAt.colIndex);
	const maxColIndex = Math.max(cellDownAt.colIndex, cellOverAt.colIndex);
	const minRowIndex = Math.min(cellDownAt.rowIndex, cellOverAt.rowIndex);
	const maxRowIndex = Math.max(cellDownAt.rowIndex, cellOverAt.rowIndex);

	const { colIndex, rowIndex } = convertGridCell({ colIndex: minColIndex, rowIndex: minRowIndex }, { numCols, numRows, colWidth, rowHeight, colOffset, rowOffset });

	const rawWidth = maxColIndex - minColIndex + 1;
	const rawHeight = maxRowIndex - minRowIndex + 1;

	const obstacle = createObstacle({ posX: colIndex, width: rawWidth, ...data });

	switch (mode) {
		case ObstaclePlacementMode.LEGACY: {
			obstacle.posY = cellOverAt.rowIndex === 2 ? 2 : 0;
			obstacle.height = cellOverAt.rowIndex === 2 ? 3 : 5;
			return clampObstacle(obstacle, rawWidth, { cellDownAt, cellOverAt }, { numCols });
		}
		case ObstaclePlacementMode.MODERN: {
			obstacle.posY = 2 * minRowIndex;
			obstacle.height = 2 * rawHeight - 1;
			return clampObstacle(obstacle, rawWidth, { cellDownAt, cellOverAt }, { numCols });
		}
		case ObstaclePlacementMode.VISUAL: {
			obstacle.posY = minRowIndex;
			obstacle.height = rawHeight;
			return clampObstacle(obstacle, rawWidth, { cellDownAt, cellOverAt }, { numCols });
		}
		case ObstaclePlacementMode.EXTENSIONS: {
			const isExtended = true;

			obstacle.posX = serializeCoordinate(colIndex, isExtended);
			obstacle.posY = serializeCoordinate(rowIndex, isExtended);
			obstacle.posY += 500;

			obstacle.width = serializeCoordinate(rawWidth * colWidth, isExtended);
			obstacle.height = serializeCoordinate(rawHeight * rowHeight, isExtended);

			return obstacle;
		}
	}
}
