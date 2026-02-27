import { DEFAULT_GRID, DEFAULT_NUM_COLS } from "$/constants";
import type { IGrid, IGridCell } from "$/types";

// With Mapping Extensions, we need to move between two different grid systems:
// - The normal game system, which has columns from 0-3, rows from 0-2
// - Our custom grid, which can have any number of columns or rows.
// For example, in an 8x3 grid (2 extra columns on each side), the top-left corner would have a position of [0,2] in our custom grid,
// but that translates to a position of [-2,2] in our natural game grid.

function transformIndex(index: number, scale: number, pivot: number, shift: number = 0) {
	return (index - shift - pivot) * scale + pivot;
}

export function convertGridColumn(colIndex: number, { numCols, colWidth }: Pick<IGrid, "numCols" | "colWidth">) {
	return transformIndex(colIndex, colWidth, (DEFAULT_NUM_COLS - 1) / 2, (numCols - DEFAULT_NUM_COLS) / 2);
}
export function convertGridRow(rowIndex: number, { rowHeight }: Pick<IGrid, "numRows" | "rowHeight">) {
	return transformIndex(rowIndex, rowHeight, 0, 0);
}

export function convertGridCell({ colIndex, rowIndex }: IGridCell, grid: IGrid = DEFAULT_GRID) {
	return { colIndex: convertGridColumn(colIndex, grid), rowIndex: convertGridRow(rowIndex, grid) };
}
