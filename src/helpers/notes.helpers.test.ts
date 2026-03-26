import type { IWrapBaseNote } from "bsmap";
import { describe, expect, it } from "vitest";

import { type IGrid, NotePlacementMode } from "$/types";
import { createNotePlacementFactory } from "./notes.helpers";

describe(createNotePlacementFactory.name, () => {
	const createNoteFromMouseEvent = createNotePlacementFactory((data) => ({ posX: data.posX, posY: data.posY }) as IWrapBaseNote);

	describe(NotePlacementMode.NORMAL, () => {
		it("creates a vanilla note", () => {
			const result = createNoteFromMouseEvent({ cellDownAt: { colIndex: 3, rowIndex: 1 } }, NotePlacementMode.NORMAL);
			expect(result?.posX).toBe(3);
			expect(result?.posY).toBe(1);
		});
	});
	describe(NotePlacementMode.EXTENSIONS, () => {
		const CUSTOM_GRID: IGrid = { numCols: 10, numRows: 10, colWidth: 0.5, rowHeight: 0.5, colOffset: 0, rowOffset: 0 };

		it("creates an extended note using the default grid", () => {
			const result = createNoteFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 0 } }, NotePlacementMode.EXTENSIONS);
			expect(result?.posX).toBe(1000);
			expect(result?.posY).toBe(1000);
		});
		it("creates an extended note using the extended grid", () => {
			const result = createNoteFromMouseEvent({ cellDownAt: { colIndex: 3, rowIndex: 1 } }, NotePlacementMode.EXTENSIONS, CUSTOM_GRID);
			expect(result?.posX).toBe(1750);
			expect(result?.posY).toBe(1500);
		});
	});
});
