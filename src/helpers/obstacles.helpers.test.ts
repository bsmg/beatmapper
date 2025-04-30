import { nanoid } from "@reduxjs/toolkit";
import type { container, v2 as v2t, v3 as v3t } from "bsmap/types";
import { describe, expect, it } from "vitest";

import { App } from "$/types";
import { deserializeObstacle, resolveObstacleId, serializeObstacle } from "./obstacles.helpers";

describe("serialization", () => {
	const wrapper: App.Obstacle[] = [
		{ id: nanoid(), beatNum: 0, beatDuration: 1, colIndex: 0, type: App.ObstacleType.FULL, colspan: 1 },
		{ id: nanoid(), beatNum: 2, beatDuration: 2, colIndex: 1, type: App.ObstacleType.FULL, colspan: 1 },
		{ id: nanoid(), beatNum: 9, beatDuration: 1, colIndex: 0, type: App.ObstacleType.FULL, colspan: 2 },
		{ id: nanoid(), beatNum: 11, beatDuration: 1, colIndex: 2, type: App.ObstacleType.FULL, colspan: 1 },
		{ id: nanoid(), beatNum: 14, beatDuration: 1, colIndex: 0, type: App.ObstacleType.TOP, colspan: 4 },
		{ id: nanoid(), beatNum: 17, beatDuration: 1, colIndex: 0, type: App.ObstacleType.FULL, colspan: 4 },
	];
	describe("obstacles (vanilla)", () => {
		describe("v2", () => {
			const v2: v2t.IObstacle[] = [
				{ _time: 0, _duration: 1, _lineIndex: 0, _type: 0, _width: 1 },
				{ _time: 2, _duration: 2, _lineIndex: 1, _type: 0, _width: 1 },
				{ _time: 9, _duration: 1, _lineIndex: 0, _type: 0, _width: 2 },
				{ _time: 11, _duration: 1, _lineIndex: 2, _type: 0, _width: 1 },
				{ _time: 14, _duration: 1, _lineIndex: 0, _type: 1, _width: 4 },
				{ _time: 17, _duration: 1, _lineIndex: 0, _type: 0, _width: 4 },
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeObstacle(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeObstacle(2, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveObstacleId(x) })));
			});
		});
		describe("v3", () => {
			const v3: v3t.IObstacle[] = [
				{ b: 0, d: 1, x: 0, y: 0, w: 1, h: 5 },
				{ b: 2, d: 2, x: 1, y: 0, w: 1, h: 5 },
				{ b: 9, d: 1, x: 0, y: 0, w: 2, h: 5 },
				{ b: 11, d: 1, x: 2, y: 0, w: 1, h: 5 },
				{ b: 14, d: 1, x: 0, y: 2, w: 4, h: 3 },
				{ b: 17, d: 1, x: 0, y: 0, w: 4, h: 5 },
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeObstacle(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeObstacle(3, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveObstacleId(x) })));
			});
		});
		describe("v4", () => {
			const v4: container.v4.IObstacleContainer[] = [
				{ object: { b: 0 }, data: { d: 1, x: 0, y: 0, w: 1, h: 5 } },
				{ object: { b: 2 }, data: { d: 2, x: 1, y: 0, w: 1, h: 5 } },
				{ object: { b: 9 }, data: { d: 1, x: 0, y: 0, w: 2, h: 5 } },
				{ object: { b: 11 }, data: { d: 1, x: 2, y: 0, w: 1, h: 5 } },
				{ object: { b: 14 }, data: { d: 1, x: 0, y: 2, w: 4, h: 3 } },
				{ object: { b: 17 }, data: { d: 1, x: 0, y: 0, w: 4, h: 5 } },
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeObstacle(4, x, {}))).toEqual(v4);
			});
			it("converts from serial to wrapper", () => {
				expect(v4.map((x) => deserializeObstacle(4, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveObstacleId(x) })));
			});
		});
	});
	describe("obstacles (mapping extensions)", () => {
		it("converts custom rows and height", () => {
			const wrapper: App.Obstacle = { id: nanoid(), type: App.ObstacleType.EXTENDED, beatNum: 2, beatDuration: 4, colIndex: 0, colspan: 1, rowIndex: 1, rowspan: 2 };
			expect([wrapper].map((x) => deserializeObstacle(2, serializeObstacle(2, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
			expect([wrapper].map((x) => deserializeObstacle(3, serializeObstacle(3, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
		});
		it("converts extended lanes", () => {
			const wrapper: App.Obstacle = { id: nanoid(), type: App.ObstacleType.EXTENDED, beatNum: 2, beatDuration: 4, colIndex: -2, colspan: 2, rowIndex: 0, rowspan: 3 };
			expect([wrapper].map((x) => deserializeObstacle(2, serializeObstacle(2, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
			expect([wrapper].map((x) => deserializeObstacle(3, serializeObstacle(3, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
		});
		it("converts narrow columns", () => {
			const wrapper: App.Obstacle = { id: nanoid(), type: App.ObstacleType.EXTENDED, beatNum: 0, beatDuration: 1, colIndex: 2.75, colspan: 0.25, rowIndex: 1, rowspan: 1 };
			expect([wrapper].map((x) => deserializeObstacle(2, serializeObstacle(2, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
			expect([wrapper].map((x) => deserializeObstacle(3, serializeObstacle(3, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
		});
		it("converts short rows", () => {
			const wrapper: App.Obstacle = { id: nanoid(), type: App.ObstacleType.EXTENDED, beatNum: 0, beatDuration: 1, colIndex: 1, colspan: 1, rowIndex: 1.25, rowspan: 0.5 };
			expect([wrapper].map((x) => deserializeObstacle(2, serializeObstacle(2, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
			expect([wrapper].map((x) => deserializeObstacle(3, serializeObstacle(3, x, { extensionsProvider: "mapping-extensions" }), { extensionsProvider: "mapping-extensions" }))).toEqual([wrapper].map((x) => ({ ...x, id: resolveObstacleId(x) })));
		});
	});
});
