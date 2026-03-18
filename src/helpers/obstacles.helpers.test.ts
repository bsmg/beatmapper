import { randomIntegerBetween } from "@std/random/integer-between";
import { describe, expect, it } from "vitest";

import { type IGrid, ObstaclePlacementMode } from "$/types";
import { clampObstacle, createObstacleFromMouseEvent } from "./obstacles.helpers";

describe(createObstacleFromMouseEvent.name, () => {
	describe(ObstaclePlacementMode.LEGACY, () => {
		it("creates a full-height obstacle (left-to-right) in a 4-lane grid", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: randomIntegerBetween(0, 2) }, cellOverAt: { colIndex: 1, rowIndex: 0 } }, ObstaclePlacementMode.LEGACY);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(2);
			expect(result?.posY).toBe(0);
			expect(result?.height).toBe(5);
		});
		it("creates a full-height obstacle (right-to-left) in a 4-lane grid", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 1, rowIndex: randomIntegerBetween(0, 2) }, cellOverAt: { colIndex: 0, rowIndex: 0 } }, ObstaclePlacementMode.LEGACY);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(2);
			expect(result?.posY).toBe(0);
			expect(result?.height).toBe(5);
		});
		it("creates a crouch obstacle (left-to-right) in a 4-lane grid", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: randomIntegerBetween(0, 2) }, cellOverAt: { colIndex: 3, rowIndex: 2 } }, ObstaclePlacementMode.LEGACY);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(4);
			expect(result?.posY).toBe(2);
			expect(result?.height).toBe(3);
		});
		it("creates a crouch obstacle (right-to-left) in a 4-lane grid", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 3, rowIndex: randomIntegerBetween(0, 2) }, cellOverAt: { colIndex: 0, rowIndex: 2 } }, ObstaclePlacementMode.LEGACY);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(4);
			expect(result?.posY).toBe(2);
			expect(result?.height).toBe(3);
		});
	});
	describe(ObstaclePlacementMode.MODERN, () => {
		it("creates a full-height obstacle (left-to-right) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 0 }, cellOverAt: { colIndex: 1, rowIndex: 2 } }, ObstaclePlacementMode.MODERN);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(2);
			expect(result?.posY).toBe(0);
			expect(result?.height).toBe(5);
		});
		it("creates a full-height obstacle (right-to-left) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 1, rowIndex: 2 }, cellOverAt: { colIndex: 0, rowIndex: 0 } }, ObstaclePlacementMode.MODERN);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(2);
			expect(result?.posY).toBe(0);
			expect(result?.height).toBe(5);
		});
		it("creates a crouch obstacle (left-to-right) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 1 }, cellOverAt: { colIndex: 3, rowIndex: 2 } }, ObstaclePlacementMode.MODERN);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(4);
			expect(result?.posY).toBe(2);
			expect(result?.height).toBe(3);
		});
		it("creates a crouch obstacle (right-to-left) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 3, rowIndex: 2 }, cellOverAt: { colIndex: 0, rowIndex: 1 } }, ObstaclePlacementMode.MODERN);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(4);
			expect(result?.posY).toBe(2);
			expect(result?.height).toBe(3);
		});
	});
	describe(ObstaclePlacementMode.VISUAL, () => {
		it("creates a full-height obstacle (left-to-right) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 0 }, cellOverAt: { colIndex: 1, rowIndex: 4 } }, ObstaclePlacementMode.VISUAL);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(2);
			expect(result?.posY).toBe(0);
			expect(result?.height).toBe(5);
		});
		it("creates a full-height obstacle (right-to-left) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 1, rowIndex: 4 }, cellOverAt: { colIndex: 0, rowIndex: 0 } }, ObstaclePlacementMode.VISUAL);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(2);
			expect(result?.posY).toBe(0);
			expect(result?.height).toBe(5);
		});
		it("creates a crouch obstacle (left-to-right) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 2 }, cellOverAt: { colIndex: 3, rowIndex: 4 } }, ObstaclePlacementMode.VISUAL);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(4);
			expect(result?.posY).toBe(2);
			expect(result?.height).toBe(3);
		});
		it("creates a crouch obstacle (right-to-left) in a 4-lane grid (no clamping)", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 3, rowIndex: 2 }, cellOverAt: { colIndex: 0, rowIndex: 4 } }, ObstaclePlacementMode.VISUAL);
			expect(result?.posX).toBe(0);
			expect(result?.width).toBe(4);
			expect(result?.posY).toBe(2);
			expect(result?.height).toBe(3);
		});
	});
	describe(ObstaclePlacementMode.EXTENSIONS, () => {
		const CUSTOM_GRID: IGrid = { numCols: 8, numRows: 4, colWidth: 2, rowHeight: 2, colOffset: 0, rowOffset: 0 };

		it("creates an extended obstacle using the default grid", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 0 }, cellOverAt: { colIndex: 1, rowIndex: 1 } }, ObstaclePlacementMode.EXTENSIONS);
			expect(result?.posX).toBe(1000);
			expect(result?.posY).toBe(1500);
			expect(result?.width).toBe(3000);
			expect(result?.height).toBe(3000);
		});
		it("creates an extended obstacle using an extended grid", () => {
			const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 3, rowIndex: 1 }, cellOverAt: { colIndex: 2, rowIndex: 1 } }, ObstaclePlacementMode.EXTENSIONS, CUSTOM_GRID);
			expect(result?.posX).toBe(-2500);
			expect(result?.posY).toBe(3500);
			expect(result?.width).toBe(5000);
			expect(result?.height).toBe(3000);
		});
	});
});

describe(clampObstacle.name, () => {
	it("clamps a dodge obstacle (left-to-right)", () => {
		const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 1 }, cellOverAt: { colIndex: 3, rowIndex: 2 } }, ObstaclePlacementMode.VISUAL);
		expect(result?.posX).toBe(2);
		expect(result?.width).toBe(2);
	});
	it("clamps a dodge obstacle (right-to-left)", () => {
		const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 2, rowIndex: 1 }, cellOverAt: { colIndex: 1, rowIndex: 1 } }, ObstaclePlacementMode.VISUAL);
		expect(result?.posX).toBe(1);
		expect(result?.width).toBe(1);
	});
	it("does not clamp a non-dodge obstacle (left-to-right)", () => {
		const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 0, rowIndex: 3 }, cellOverAt: { colIndex: 3, rowIndex: 4 } }, ObstaclePlacementMode.VISUAL);
		expect(result?.posX).toBe(0);
		expect(result?.width).toBe(4);
	});
	it("does not clamp a non-dodge obstacle (right-to-left)", () => {
		const result = createObstacleFromMouseEvent({ cellDownAt: { colIndex: 2, rowIndex: 0 }, cellOverAt: { colIndex: 1, rowIndex: 0 } }, ObstaclePlacementMode.VISUAL);
		expect(result?.posX).toBe(1);
		expect(result?.width).toBe(2);
	});
});
