import type { IV2Bookmark, IV3Bookmark } from "bsmap";
import { describe, expect, it } from "vitest";

import type { App } from "$/types";
import { deserializeCustomBookmark, serializeCustomBookmark } from "./bookmarks.helpers";

describe("bookmark serialization", () => {
	const wrapper: App.IBookmark[] = [
		{ time: 32, name: "buildup", color: "#ff0000" },
		{ time: 128, name: "drop", color: "#ff0000" },
	];
	describe("custom difficulty bookmarks", () => {
		describe("v2", () => {
			const v2: IV2Bookmark[] = [
				{ _time: 32, _name: "buildup", _color: [1, 0, 0] as [number, number, number] },
				{ _time: 128, _name: "drop", _color: [1, 0, 0] as [number, number, number] },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeCustomBookmark(x, 2, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeCustomBookmark(x, 2, {}))).toEqual(wrapper);
			});
		});
		describe("v3", () => {
			const v3: IV3Bookmark[] = [
				{ b: 32, n: "buildup", c: [1, 0, 0] },
				{ b: 128, n: "drop", c: [1, 0, 0] },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeCustomBookmark(x, 3, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeCustomBookmark(x, 3, {}))).toEqual(wrapper);
			});
		});
	});
});
