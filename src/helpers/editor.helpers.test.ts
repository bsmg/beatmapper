import { describe, expect, it } from "vitest";

import { calculateQuickSelectRange } from "./editor.helpers";

describe(calculateQuickSelectRange.name, () => {
	const currentBeat = 10;

	it("should parse '+3' as current to current + 3", () => {
		expect(calculateQuickSelectRange("+3", currentBeat)).toEqual([10, 13]);
	});
	it("should parse '-3' as current - 3 to current", () => {
		expect(calculateQuickSelectRange("-3", currentBeat)).toEqual([7, 10]);
	});
	it("should parse '3' as an exact point at 3", () => {
		expect(calculateQuickSelectRange("3", currentBeat)).toEqual([3, 3]);
	});
	it("should parse '3-6' as an absolute range from 3 to 6", () => {
		expect(calculateQuickSelectRange("3-6", currentBeat)).toEqual([3, 6]);
	});

	it("should handle fudge factor", () => {
		expect(calculateQuickSelectRange("3-6", currentBeat, 0.001)).toEqual([3, 5.999]);
	});
});
