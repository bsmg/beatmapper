// biome-ignore lint/correctness/noUnusedImports: false positive
import { v2, v3 } from "bsmap/types";
import { describe, expect, it } from "vitest";

import type { App } from "$/types";
import { BOOKMARK_COLORS, deserializeCustomBookmark, getNewBookmarkColor, serializeCustomBookmark } from "./bookmarks.helpers";

describe("bookmark serialization", () => {
	const wrapper: App.IBookmark[] = [
		{ time: 32, name: "buildup", color: "#ff0000" },
		{ time: 128, name: "drop", color: "#ff0000" },
	];
	describe("custom difficulty bookmarks", () => {
		describe("v2", () => {
			const v2: v2.IBookmark[] = [
				{ _time: 32, _name: "buildup", _color: [1, 0, 0] as [number, number, number] },
				{ _time: 128, _name: "drop", _color: [1, 0, 0] as [number, number, number] },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeCustomBookmark(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeCustomBookmark(2, x, {}))).toEqual(wrapper);
			});
		});
		describe("v3", () => {
			const v3: v3.IBookmark[] = [
				{ b: 32, n: "buildup", c: [1, 0, 0] },
				{ b: 128, n: "drop", c: [1, 0, 0] },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeCustomBookmark(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeCustomBookmark(3, x, {}))).toEqual(wrapper);
			});
		});
	});
});

describe(getNewBookmarkColor.name, () => {
	it("returns the first color for the first bookmark", () => {
		const bookmarks: Pick<App.IBookmark, "color">[] = [] as App.IBookmark[];
		expect(getNewBookmarkColor(bookmarks)).toBe(BOOKMARK_COLORS[0]);
	});
	it("returns the third color when the first two are used", () => {
		const bookmarks: Pick<App.IBookmark, "color">[] = [
			{ color: BOOKMARK_COLORS[0] },
			{ color: BOOKMARK_COLORS[1] },
			//
		];
		expect(getNewBookmarkColor(bookmarks)).toBe(BOOKMARK_COLORS[2]);
	});
	it("fills in a hole if a value was deleted", () => {
		const bookmarks: Pick<App.IBookmark, "color">[] = [
			{ color: BOOKMARK_COLORS[0] },
			{ color: BOOKMARK_COLORS[1] },
			{ color: BOOKMARK_COLORS[2] },
			//
		];
		// Delete the middle item.
		// Bookmarks will now be [first, third].
		bookmarks.splice(1, 1);
		// It should pick the 2nd color, to fill in the missing one.
		expect(getNewBookmarkColor(bookmarks)).toBe(BOOKMARK_COLORS[1]);
	});
	it("picks the first value at the 7th bookmark", () => {
		// This test relies on randomness! This is a hard thing to test.
		// Rather than be 100% definitive, I'm going to be 99.9999% definitive.
		const bookmarks: Pick<App.IBookmark, "color">[] = [
			{ color: BOOKMARK_COLORS[0] },
			{ color: BOOKMARK_COLORS[1] },
			{ color: BOOKMARK_COLORS[2] },
			{ color: BOOKMARK_COLORS[3] },
			{ color: BOOKMARK_COLORS[4] },
			{ color: BOOKMARK_COLORS[5] },
			//
		];
		expect(getNewBookmarkColor(bookmarks)).toBe(BOOKMARK_COLORS[0]);
	});
});
