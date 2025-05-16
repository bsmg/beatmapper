import { createBasicEvent } from "bsmap";
import { describe, expect, it } from "vitest";

import { resolveEventValue } from "$/helpers/events.helpers";
import { App, type IBackgroundBox } from "$/types";
import { createBackgroundBoxes } from "./track.helpers";

const LIGHTING_TRACK_ID = App.TrackId[4];

// These tests have comments to quickly explain the situation they're testing:
//   R [__0_B___]
// To read this:
// - The "array" holds 8 beats, representing the event-grid for a given frame.
// - The frame can have `R` events (Red light on), `B` events (Blue light on), or `0` (light off)
// - The letter to the left of the array represents the initial light value, the value it held before the current frame started

describe("BlockTrack helpers", () => {
	describe(createBackgroundBoxes.name, () => {
		it("exits early if it is not a lighting track", () => {
			const trackId = App.TrackId[12];
			const events: App.IBasicEvent[] = [
				// Technically these events are illegal; this is just testing that it doesn't even look at events when the trackId isn't lighting
				createBasicEvent({
					type: trackId,
					time: 3,
					value: resolveEventValue({ effect: App.BasicEventType.ON, color: App.EventColor.PRIMARY }, {}),
					floatValue: 1,
				}),
				createBasicEvent({
					type: trackId,
					time: 4,
					value: resolveEventValue({ effect: App.BasicEventType.OFF }, {}),
				}),
			];
			const initialTrackLightingColorType = null;
			const startBeat = 0;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [];
			const actualResult = createBackgroundBoxes(events, trackId, { initialColor: initialTrackLightingColorType, startBeat, numOfBeatsToShow });

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles an empty set of events without initial lighting", () => {
			//  0  [________]
			const events: App.IBasicEvent[] = [];
			const initialTrackLightingColorType = null;
			const startBeat = 0;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [];
			const actualResult = createBackgroundBoxes(events, LIGHTING_TRACK_ID, { initialColor: initialTrackLightingColorType, startBeat, numOfBeatsToShow });

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles an empty set of events WITH initial lighting", () => {
			//  R  [________]
			const events: App.IBasicEvent[] = [];
			const initialTrackLightingColorType = App.EventColor.PRIMARY;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					time: 8,
					duration: 8,
					startColor: App.EventColor.PRIMARY,
					endColor: App.EventColor.PRIMARY,
					startBrightness: 1,
					endBrightness: 1,
				},
			];
			const actualResult = createBackgroundBoxes(events, LIGHTING_TRACK_ID, { initialColor: initialTrackLightingColorType, startBeat, numOfBeatsToShow });

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles a basic on-off case", () => {
			//  0  [R___0___]
			const events: App.IBasicEvent[] = [
				createBasicEvent({
					type: App.TrackId[2],
					time: 8,
					value: resolveEventValue({ effect: App.BasicEventType.ON, color: App.EventColor.PRIMARY }, {}),
					floatValue: 1,
				}),
				createBasicEvent({
					type: App.TrackId[2],
					time: 12,
					value: resolveEventValue({ effect: App.BasicEventType.OFF }, {}),
				}),
			];
			const initialTrackLightingColorType = null;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					time: 8,
					duration: 4,
					startColor: App.EventColor.PRIMARY,
					endColor: App.EventColor.PRIMARY,
					startBrightness: 1,
					endBrightness: 1,
				},
			];
			const actualResult = createBackgroundBoxes(events, LIGHTING_TRACK_ID, { initialColor: initialTrackLightingColorType, startBeat, numOfBeatsToShow });

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles turning on when already on", () => {
			//  R  [____R___]
			const events: App.IBasicEvent[] = [
				createBasicEvent({
					type: App.TrackId[2],
					time: 12,
					value: resolveEventValue({ effect: App.BasicEventType.ON, color: App.EventColor.PRIMARY }, {}),
					floatValue: 1,
				}),
			];
			const initialTrackLightingColorType = App.EventColor.PRIMARY;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					time: 8,
					duration: 4,
					startColor: App.EventColor.PRIMARY,
					endColor: App.EventColor.PRIMARY,
					startBrightness: 1,
					endBrightness: 1,
				},
				{
					time: 12,
					duration: 4,
					startColor: App.EventColor.PRIMARY,
					endColor: App.EventColor.PRIMARY,
					startBrightness: 1,
					endBrightness: 1,
				},
			];
			const actualResult = createBackgroundBoxes(events, LIGHTING_TRACK_ID, { initialColor: initialTrackLightingColorType, startBeat, numOfBeatsToShow });

			expect(actualResult).toEqual(expectedResult);
		});

		it("handles color changes", () => {
			//  0  [R___B_0_]
			const events: App.IBasicEvent[] = [
				createBasicEvent({
					type: App.TrackId[2],
					time: 8,
					value: resolveEventValue({ effect: App.BasicEventType.ON, color: App.EventColor.PRIMARY }, {}),
					floatValue: 1,
				}),
				createBasicEvent({
					type: App.TrackId[2],
					time: 12,
					value: resolveEventValue({ effect: App.BasicEventType.ON, color: App.EventColor.SECONDARY }, {}),
					floatValue: 1,
				}),
				createBasicEvent({
					type: App.TrackId[2],
					time: 14,
					value: resolveEventValue({ effect: App.BasicEventType.OFF }, {}),
				}),
			];
			const initialTrackLightingColorType = null;
			const startBeat = 8;
			const numOfBeatsToShow = 8;

			const expectedResult: IBackgroundBox[] = [
				{
					time: 8,
					duration: 4,
					startColor: App.EventColor.PRIMARY,
					endColor: App.EventColor.PRIMARY,
					startBrightness: 1,
					endBrightness: 1,
				},
				{
					time: 12,
					duration: 2,
					startColor: App.EventColor.SECONDARY,
					endColor: App.EventColor.SECONDARY,
					startBrightness: 1,
					endBrightness: 1,
				},
			];
			const actualResult = createBackgroundBoxes(events, LIGHTING_TRACK_ID, { initialColor: initialTrackLightingColorType, startBeat, numOfBeatsToShow });

			expect(actualResult).toEqual(expectedResult);
		});
	});
});
