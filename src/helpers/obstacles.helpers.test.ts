import type { v2 } from "bsmap/types";
import { describe, expect, it } from "vitest";

import { App } from "$/types";
import { omit } from "$/utils";
import { convertObstaclesToExportableJson, convertObstaclesToRedux } from "./obstacles.helpers";

const SAMPLE_PROPRIETARY_DATA: v2.IObstacle[] = [
	{ _time: 0, _lineIndex: 0, _type: 0, _duration: 1, _width: 1 },
	{ _time: 2, _lineIndex: 1, _type: 0, _duration: 2, _width: 1 },
	{ _time: 9, _lineIndex: 0, _type: 0, _duration: 1, _width: 2 },
	{ _time: 11, _lineIndex: 2, _type: 0, _duration: 1, _width: 1 },
	{ _time: 14, _lineIndex: 0, _type: 1, _duration: 1, _width: 4 },
	{ _time: 17, _lineIndex: 0, _type: 0, _duration: 1, _width: 4 },
	// Invalid, should truncate:
	{ _time: 17, _lineIndex: 2, _type: 0, _duration: 1, _width: 10 },
];

const SAMPLE_REDUX_DATA: App.Obstacle[] = [
	{ id: "a", beatNum: 2, beatDuration: 4, colIndex: 0, type: App.ObstacleType.FULL, colspan: 2 },
	{ id: "b", beatNum: 4, beatDuration: 0, colIndex: 2, type: App.ObstacleType.TOP, colspan: 2 },
	{ id: "c", beatNum: 4, beatDuration: 4, colIndex: 0, type: App.ObstacleType.FULL, colspan: 1 },
];

describe("Obstacles helpers", () => {
	it("converts an array of objects to redux", () => {
		const actualResult = convertObstaclesToRedux(SAMPLE_PROPRIETARY_DATA);

		// Do verify that IDs are added though!
		for (const result of actualResult) {
			expect(typeof result.id).toEqual("string");
		}

		const expectedResult: App.Obstacle[] = [
			{ id: "a", beatNum: 0, beatDuration: 1, colIndex: 0, type: App.ObstacleType.FULL, colspan: 1 },
			{ id: "b", beatNum: 2, beatDuration: 2, colIndex: 1, type: App.ObstacleType.FULL, colspan: 1 },
			{ id: "c", beatNum: 9, beatDuration: 1, colIndex: 0, type: App.ObstacleType.FULL, colspan: 2 },
			{ id: "d", beatNum: 11, beatDuration: 1, colIndex: 2, type: App.ObstacleType.FULL, colspan: 1 },
			{ id: "e", beatNum: 14, beatDuration: 1, colIndex: 0, type: App.ObstacleType.TOP, colspan: 4 },
			{ id: "f", beatNum: 17, beatDuration: 1, colIndex: 0, type: App.ObstacleType.FULL, colspan: 4 },
			{ id: "g", beatNum: 17, beatDuration: 1, colIndex: 2, type: App.ObstacleType.FULL, colspan: 2 },
		];

		expect(actualResult.map((x) => omit(x, "id"))).toEqual(expectedResult.map((x) => omit(x, "id")));
	});

	it("converts from redux to proprietary", () => {
		const actualResult = convertObstaclesToExportableJson(SAMPLE_REDUX_DATA);
		const expectedResult: v2.IObstacle[] = [
			{ _time: 2, _lineIndex: 0, _type: 0, _duration: 4, _width: 2 },
			{ _time: 4, _lineIndex: 2, _type: 1, _duration: 0.01, _width: 2 },
			{ _time: 4, _lineIndex: 0, _type: 0, _duration: 4, _width: 1 },
		];

		expect(actualResult).toEqual(expectedResult);
	});

	it("converts full-circle", () => {
		const validData = SAMPLE_PROPRIETARY_DATA.slice(0, 3);
		const actualResult = convertObstaclesToExportableJson(convertObstaclesToRedux(validData));
		const expectedResult = validData;

		expect(actualResult).toEqual(expectedResult);
	});

	describe("mapping extensions", () => {
		it("converts an obstacle that includes a custom row index and span", () => {
			// This test obstacle takes up the top 2 rows in a 4×3 grid
			//   [X _ _ _]
			//   [X _ _ _]
			//   [_ _ _ _]
			const obstacle: App.Obstacle = {
				id: "a",
				type: App.ObstacleType.EXTENDED,
				beatNum: 2,
				beatDuration: 4,
				colIndex: 0,
				colspan: 1,
				rowIndex: 1,
				rowspan: 2,
			};

			const actualResult = convertObstaclesToExportableJson([obstacle]);
			const expectedResult: v2.IObstacle[] = [
				{
					_time: 2,
					_lineIndex: 1000,
					_type: 404251,
					_duration: 4,
					_width: 2000,
				},
			];

			expect(actualResult).toEqual(expectedResult);
		});
	});

	it("converts an obstacle in a wider 8x3 grid", () => {
		// X X [_ _ _ _] _ _
		// X X [_ _ _ _] _ _
		// X X [_ _ _ _] _ _
		const gridCols = 8;
		const obstacle: App.Obstacle = {
			id: "a",
			type: App.ObstacleType.EXTENDED,
			beatNum: 2,
			beatDuration: 4,
			colIndex: -2,
			colspan: 2,
			rowIndex: 0,
			rowspan: 3,
		};

		const actualResult = convertObstaclesToExportableJson([obstacle], gridCols);
		const expectedResult: v2.IObstacle[] = [
			{
				_time: 2,
				_lineIndex: -3000,
				_type: 604101,
				_duration: 4,
				_width: 3000,
			},
		];

		expect(actualResult).toEqual(expectedResult);
	});

	it("Converts an 8x3 grid to Redux", () => {
		const proprietaryData: v2.IObstacle[] = [
			{
				_time: 2,
				_lineIndex: -3000,
				_type: 604101,
				_duration: 4,
				_width: 4000,
			},
		];

		const actualResult = convertObstaclesToRedux(proprietaryData);

		// The method adds random IDs to every entity.
		// We can't compare them directly since we don't know the IDs.
		const actualWithoutIds = actualResult.map((r) => {
			const copy = omit(r, "id");
			return copy;
		});

		const expectedResult: Omit<App.IExtensionObstacle, "id">[] = [
			{
				type: App.ObstacleType.EXTENDED,
				beatNum: 2,
				beatDuration: 4,
				colIndex: -2,
				colspan: 3,
				rowIndex: 0,
				rowspan: 3,
			},
		];

		expect(actualWithoutIds).toEqual(expectedResult);
	});

	describe("With different cell widths/heights", () => {
		it("handles narrower columns", () => {
			// This grid is 10x3 with 0.25x columns
			// First, just check and make sure I get the same values in and out.
			const gridCols = 10;
			const obstacle: App.Obstacle = {
				id: "a",
				beatDuration: 1,
				beatNum: 0,
				colspan: 0.25,
				colIndex: 2.75,
				rowIndex: 1,
				rowspan: 1,
				type: App.ObstacleType.EXTENDED,
			};

			const exportableJson = convertObstaclesToExportableJson([obstacle], gridCols);
			const [backToRedux] = convertObstaclesToRedux(exportableJson, gridCols);

			// We'll lose the ID in the back-and-forth conversion, which is OK.
			// Let's add it back in
			backToRedux.id = obstacle.id;

			expect(backToRedux).toEqual(obstacle);
		});
		it("handles shorter rows", () => {
			// This grid is 4x10 with 0.25x columns
			// First, just check and make sure I get the same values in and out.
			const gridCols = 4;
			const obstacle: App.Obstacle = {
				id: "a",
				beatDuration: 1,
				beatNum: 0,
				colspan: 1,
				colIndex: 1,
				rowIndex: 1.25,
				rowspan: 0.5,
				type: App.ObstacleType.EXTENDED,
			};

			const exportableJson = convertObstaclesToExportableJson([obstacle], gridCols);

			const [backToRedux] = convertObstaclesToRedux(exportableJson, gridCols);

			// We'll lose the ID in the back-and-forth conversion, which is OK.
			// Let's add it back in
			backToRedux.id = obstacle.id;

			expect(backToRedux).toEqual(obstacle);
		});
	});
});
