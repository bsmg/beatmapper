import { describe, expect, it } from "vitest";

import { DEFAULT_GRID } from "$/constants";
import { convertGridCell, convertGridColumn, convertGridRow } from "./grid.helpers";

describe("Grid helpers", () => {
	describe(convertGridRow.name, () => {
		it("converts the first row in a 4x4 grid (1 extra row)", () => {
			const actualPosition = convertGridRow(0, { ...DEFAULT_GRID, numRows: 4 });
			const expectedPosition = 0;

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("converts the fourth row in a 4x4 grid (1 extra row)", () => {
			const actualPosition = convertGridRow(3, { ...DEFAULT_GRID, numRows: 4 });
			const expectedPosition = 3;

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("Handles a row which is half-height", () => {
			const actualPosition = convertGridRow(2, { ...DEFAULT_GRID, rowHeight: 0.5 });
			const expectedPosition = 1;

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("Handles a row which is half-height + more rows", () => {
			const actualPosition = convertGridRow(5, { ...DEFAULT_GRID, numRows: 6, rowHeight: 0.25 });
			const expectedPosition = 1.25;

			expect(actualPosition).toEqual(expectedPosition);
		});
	});

	describe(convertGridCell.name, () => {
		it("has no effect on a 4x3 grid", () => {
			const actualPosition = convertGridCell({ colIndex: 1, rowIndex: 2 });
			const expectedPosition = { colIndex: 1, rowIndex: 2 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("converts a 5x3 grid (1 extra col)", () => {
			const actualPosition = convertGridCell({ colIndex: 1, rowIndex: 2 }, { ...DEFAULT_GRID, numCols: 5 });
			const expectedPosition = { colIndex: 0.5, rowIndex: 2 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("converts an 8x3 grid (2 extra cols on each side)", () => {
			const actualPosition = convertGridCell({ colIndex: 0, rowIndex: 2 }, { ...DEFAULT_GRID, numCols: 8 });
			const expectedPosition = { colIndex: -2, rowIndex: 2 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("converts a 3x3 grid (less cols)", () => {
			const actualPosition = convertGridCell({ colIndex: 1, rowIndex: 2 }, { ...DEFAULT_GRID, numCols: 3 });
			const expectedPosition = { colIndex: 1.5, rowIndex: 2 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("handles a 4x3 grid with half-width columns", () => {
			const actualPosition = convertGridCell({ colIndex: 0, rowIndex: 0 }, { ...DEFAULT_GRID, colWidth: 0.5 });
			const expectedPosition = { colIndex: 0.75, rowIndex: 0 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("calculates the 2,0 cell in a half-column-width grid", () => {
			const actualPosition = convertGridCell({ colIndex: 2, rowIndex: 0 }, { ...DEFAULT_GRID, colWidth: 0.5 });
			const expectedPosition = { colIndex: 1.75, rowIndex: 0 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("calculates the -1,1 cell in a half-size grid", () => {
			const actualPosition = convertGridCell({ colIndex: -1, rowIndex: 1 }, { ...DEFAULT_GRID, colWidth: 0.5, rowHeight: 0.5 });
			const expectedPosition = { colIndex: 0.25, rowIndex: 0.5 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("calculates the 0,0 cell in an oversized 4x-width grid", () => {
			const actualPosition = convertGridCell({ colIndex: 0, rowIndex: 0 }, { ...DEFAULT_GRID, colWidth: 4 });
			const expectedPosition = { colIndex: -4.5, rowIndex: 0 };

			expect(actualPosition).toEqual(expectedPosition);
		});
		it("calculates the 0,0 cell in a half-column width 5x3 grid", () => {
			const actualPosition = convertGridCell({ colIndex: 0, rowIndex: 0 }, { ...DEFAULT_GRID, numCols: 5, colWidth: 0.5 });
			const expectedPosition = { colIndex: 0.5, rowIndex: 0 };

			expect(actualPosition).toEqual(expectedPosition);
		});
	});
	it("always produces an identical value for the middle column", () => {
		const colIndex = 2;
		const numCols = 5;

		const narrowX = convertGridColumn(colIndex, { numCols, colWidth: 0.5, colOffset: 0 });
		const wideX = convertGridColumn(colIndex, { numCols, colWidth: 2.5, colOffset: 0 });

		expect(narrowX).toEqual(wideX);
	});
	it("always produces an identical value for the bottom row", () => {
		const rowIndex = 0;
		const numRows = 3;

		const narrowY = convertGridRow(rowIndex, { numRows, rowHeight: 0.5, rowOffset: 0 });
		const wideY = convertGridRow(rowIndex, { numRows, rowHeight: 3, rowOffset: 0 });

		expect(narrowY).toEqual(wideY);
	});
});
