import { describe, expect, it } from "vitest";

import { App, type IBackgroundBox } from "$/types";
import { getBackgroundBoxes } from "./BlockTrack.helpers";

const LIGHTING_TRACK_ID = App.TrackId[4];

// These tests have comments to quickly explain the situation they're testing:
//   R [__0_B___]
// To read this:
// - The "array" holds 8 beats, representing the event-grid for a given frame.
// - The frame can have `R` events (Red light on), `B` events (Blue light on), or `0` (light off)
// - The letter to the left of the array represents the initial light value, the value it held before the current frame started

describe("BlockTrack helpers", () => {
	describe("getBackgroundBoxes", () => {
		it("exits early if it is not a lighting track", () => {
			const trackId = App.TrackId[12];
			const events = [
				// Technically these events are illegal; this is just testing that it doesn't even look at events when the trackId isn't lighting
				{
					trackId,
					beatNum: 3,
					id: "a",
					type: App.BasicEventType.ON,
					colorType: App.EventColor.PRIMARY,
				},
				{
					trackId,
					beatNum: 4,
					id: "b",
					type: App.BasicEventType.OFF,
				},
			] as unknown as App.BasicEvent[];
			const initialTrackLightingColorType = null;
			const startBeat = 0;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [];
			const actualResult = getBackgroundBoxes(events, trackId, initialTrackLightingColorType, startBeat, numOfBeatsToShow);

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles an empty set of events without initial lighting", () => {
			//  0  [________]
			const events: App.IBasicLightEvent[] = [];
			const initialTrackLightingColorType = null;
			const startBeat = 0;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [];
			const actualResult = getBackgroundBoxes(events, LIGHTING_TRACK_ID, initialTrackLightingColorType, startBeat, numOfBeatsToShow);

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles an empty set of events WITH initial lighting", () => {
			//  R  [________]
			const events: App.IBasicLightEvent[] = [];
			const initialTrackLightingColorType = App.EventColor.PRIMARY;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					id: "initial-8-8",
					beatNum: 8,
					duration: 8,
					colorType: App.EventColor.PRIMARY,
				},
			];
			const actualResult = getBackgroundBoxes(events, LIGHTING_TRACK_ID, initialTrackLightingColorType, startBeat, numOfBeatsToShow);

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles a basic on-off case", () => {
			//  0  [R___0___]
			const events: App.IBasicLightEvent[] = [
				{
					id: "a",
					trackId: App.TrackId[2],
					beatNum: 8,
					type: App.BasicEventType.ON,
					colorType: App.EventColor.PRIMARY,
				},
				{
					id: "b",
					trackId: App.TrackId[2],
					beatNum: 12,
					type: App.BasicEventType.OFF,
				},
			];
			const initialTrackLightingColorType = null;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					id: "a",
					beatNum: 8,
					duration: 4,
					colorType: App.EventColor.PRIMARY,
				},
			];
			const actualResult = getBackgroundBoxes(events, LIGHTING_TRACK_ID, initialTrackLightingColorType, startBeat, numOfBeatsToShow);

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles turning on when already on", () => {
			//  R  [____R___]
			const events: App.IBasicLightEvent[] = [
				{
					id: "a",
					trackId: App.TrackId[2],
					beatNum: 12,
					type: App.BasicEventType.ON,
					colorType: App.EventColor.PRIMARY,
				},
			];
			const initialTrackLightingColorType = App.EventColor.PRIMARY;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				// Should be a single box filling the available space.
				{
					id: "initial-8-8",
					beatNum: 8,
					duration: 8,
					colorType: App.EventColor.PRIMARY,
				},
			];
			const actualResult = getBackgroundBoxes(events, LIGHTING_TRACK_ID, initialTrackLightingColorType, startBeat, numOfBeatsToShow);

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles color changes", () => {
			//  0  [R___B_0_]
			const events: App.IBasicLightEvent[] = [
				{
					id: "a",
					trackId: App.TrackId[2],
					beatNum: 8,
					type: App.BasicEventType.ON,
					colorType: App.EventColor.PRIMARY,
				},
				{
					id: "b",
					trackId: App.TrackId[2],
					beatNum: 12,
					type: App.BasicEventType.ON,
					colorType: App.EventColor.SECONDARY,
				},
				{
					id: "b",
					trackId: App.TrackId[2],
					beatNum: 14,
					type: App.BasicEventType.OFF,
				},
			];
			const initialTrackLightingColorType = null;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					id: "a",
					beatNum: 8,
					duration: 4,
					colorType: App.EventColor.PRIMARY,
				},
				{
					id: "b",
					beatNum: 12,
					duration: 2,
					colorType: App.EventColor.SECONDARY,
				},
			];
			const actualResult = getBackgroundBoxes(events, LIGHTING_TRACK_ID, initialTrackLightingColorType, startBeat, numOfBeatsToShow);

			expect(actualResult).toEqual(expectedResult);
		});
	});
});
