import { describe, expect, it } from "vitest";

import { convertBeatsToMilliseconds, convertMillisecondsToBeats } from "./audio.helpers";

describe("timescale conversion", () => {
	describe(convertMillisecondsToBeats.name, () => {
		it("converts 1000ms", () => {
			expect(convertMillisecondsToBeats(1000, 120)).toEqual(2);
		});
		it("does not produce floating point results for beats", () => {
			expect(convertMillisecondsToBeats(1028.5714285714284, 175)).toEqual(3);
		});
	});
	describe(convertBeatsToMilliseconds.name, () => {
		it("converts 8 beats", () => {
			expect(convertBeatsToMilliseconds(8, 60)).toEqual(8000);
		});
	});
	it("converts in both directions", () => {
		const bpm = 90;
		expect(convertBeatsToMilliseconds(convertMillisecondsToBeats(250, bpm), bpm)).toEqual(250);
		expect(convertBeatsToMilliseconds(convertMillisecondsToBeats(250, bpm), bpm)).toEqual(250);
	});
});
