import { createBasicEvent } from "bsmap";
import type { wrapper } from "bsmap/types";
import { describe, expect, it } from "vitest";

import { serializeBasicEventValue } from "$/helpers/events.helpers";
import { App, ColorSchemeKey, type IBackgroundBox, type IColorScheme, type IEventTracks } from "$/types";
import { createBackgroundBoxes } from "./track.helpers";

describe(createBackgroundBoxes.name, () => {
	// These tests have comments to quickly explain the situation they're testing:
	//   R [__0_B___]
	// To read this:
	// - The "array" holds 8 beats, representing the event-grid for a given frame.
	// - The frame can have `R` events (Red light on), `B` events (Blue light on), or `0` (light off)
	// - The letter to the left of the array represents the initial light value, the value it held before the current frame started

	const tracks = {
		2: { type: "blocks" },
		12: { type: "speed" },
	} as IEventTracks;

	const colorScheme = {
		[ColorSchemeKey.ENV_LEFT]: "#cc0000",
		[ColorSchemeKey.ENV_RIGHT]: "#0000cc",
		[ColorSchemeKey.BOOST_LEFT]: "#ff4444",
		[ColorSchemeKey.BOOST_RIGHT]: "#4444ff",
	} as IColorScheme;

	it("exits early if it is not a lighting track", () => {
		const startBeat = 0;
		const numOfBeatsToShow = 8;
		// Technically these events are illegal; this is just testing that it doesn't even look at events when the trackId isn't lighting
		const basicEvents: wrapper.IWrapBasicEvent[] = [
			createBasicEvent({
				type: 12,
				time: 3,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
			createBasicEvent({
				type: 12,
				time: 4,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.OFF }, { tracks }),
			}),
		];

		const expectedResult: IBackgroundBox[] = [];
		const actualResult = createBackgroundBoxes(12, { tracks, colorScheme, basicEvents, initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles an empty set of events without initial lighting", () => {
		//  0  [________]
		const startBeat = 0;
		const numOfBeatsToShow = 8;
		const basicEvents: wrapper.IWrapBasicEvent[] = [];

		const expectedResult: IBackgroundBox[] = [];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles an empty set of events WITH initial lighting", () => {
		//  R  [________]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: wrapper.IWrapBasicEvent[] = [];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 8,
				duration: 8,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
		];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, initialLightState: { color: colorScheme.envColorLeft, brightness: 1 }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles a basic on-off case", () => {
		//  0  [R___0___]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: wrapper.IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 8,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
			createBasicEvent({
				type: 2,
				time: 12,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.OFF }, { tracks }),
			}),
		];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 8,
				duration: 4,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
		];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles turning on when already on", () => {
		//  R  [____R___]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: wrapper.IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 12,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
		];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 8,
				duration: 4,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
			{
				time: 12,
				duration: 4,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
		];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, initialLightState: { color: colorScheme.envColorLeft, brightness: 1 }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles color changes", () => {
		//  0  [R___B_0_]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: wrapper.IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 8,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
			createBasicEvent({
				type: 2,
				time: 12,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.SECONDARY }, { tracks }),
				floatValue: 1,
			}),
			createBasicEvent({
				type: 2,
				time: 14,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.OFF }, { tracks }),
			}),
		];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 8,
				duration: 4,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
			{
				time: 12,
				duration: 2,
				startState: { color: colorScheme.envColorRight, brightness: 1 },
				endState: { color: colorScheme.envColorRight, brightness: 1 },
			},
		];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});
});
