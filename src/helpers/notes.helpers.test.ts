import { describe, expect, it } from "vitest";

import { calculateNoteDensity } from "./notes.helpers";

describe(calculateNoteDensity.name, () => {
	it("gets note density for a simple case", () => {
		const numOfNotes = 10;
		const segmentLengthInBeats = 10;
		const bpm = 60;
		expect(calculateNoteDensity(numOfNotes, segmentLengthInBeats, bpm)).toEqual(1);
	});
	it("gets note density for a slightly less simple case", () => {
		const numOfNotes = 15;
		const segmentLengthInBeats = 10;
		const bpm = 100;
		expect(calculateNoteDensity(numOfNotes, segmentLengthInBeats, bpm)).toEqual(2.5);
	});
	it("handles 0 notes", () => {
		const numOfNotes = 0;
		const segmentLengthInBeats = 12;
		const bpm = 100;
		expect(calculateNoteDensity(numOfNotes, segmentLengthInBeats, bpm)).toEqual(0);
	});
});
