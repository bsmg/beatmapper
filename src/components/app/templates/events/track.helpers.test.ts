import { createBasicEvent, createColorBoostEvent, type IWrapBasicEvent, type IWrapColorBoostEvent } from "bsmap";
import { describe, expect, it } from "vitest";

import { serializeBasicEventValue } from "$/helpers/events.helpers";
import { App, ColorSchemeKey, type IBackgroundBox, type IColorScheme, type IEventTracks } from "$/types";
import { lerp, lerpColor } from "$/utils";
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
		const basicEvents: IWrapBasicEvent[] = [
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
		const actualResult = createBackgroundBoxes(12, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles an empty set of events without initial lighting", () => {
		//  0  [________]
		const startBeat = 0;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [];

		const expectedResult: IBackgroundBox[] = [];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles an empty set of events WITH initial lighting", () => {
		//  R  [________]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 0,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
		];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 8,
				duration: 8,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
		];
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: colorScheme.envColorLeft, brightness: 1 }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles a basic on-off case", () => {
		//  0  [R___0___]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [
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
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles turning on when already on", () => {
		//  R  [____R___]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 0,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
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
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: colorScheme.envColorLeft, brightness: 1 }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles color changes", () => {
		//  0  [R___B_0_]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [
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
		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles brightness changes", () => {
		// 0  [R---R___]
		const startBeat = 0;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 0,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 0.5,
			}),
			createBasicEvent({
				type: 2,
				time: 4,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 0.25,
			}),
		];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 0,
				duration: 4,
				startState: { color: colorScheme.envColorLeft, brightness: 0.5 },
				endState: { color: colorScheme.envColorLeft, brightness: 0.5 },
			},
			{
				time: 4,
				duration: 4,
				startState: { color: colorScheme.envColorLeft, brightness: 0.25 },
				endState: { color: colorScheme.envColorLeft, brightness: 0.25 },
			},
		];

		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles interpolation for transitions", () => {
		// R  [\\\b___]
		const startBeat = 8;
		const numOfBeatsToShow = 8;

		const basicEvents: IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 16,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.TRANSITION, color: App.EventColor.SECONDARY }, { tracks }),
				floatValue: 1.0,
			}),
		];

		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents: [], initialLightState: { color: colorScheme.envColorLeft, brightness: 0 }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult[0]).toEqual({
			time: 8,
			duration: 8,
			startState: {
				color: lerpColor(colorScheme.envColorLeft, colorScheme.envColorRight, 0.5),
				brightness: lerp(0, 1.0, 0.5),
			},
			endState: {
				color: lerpColor(colorScheme.envColorLeft, colorScheme.envColorRight, 1),
				brightness: lerp(0, 1.0, 1),
			},
		});
	});

	it("handles color boost", () => {
		//  0  [R_!___._]
		const startBeat = 8;
		const numOfBeatsToShow = 8;
		const basicEvents: IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 8,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 1,
			}),
		];
		const boostEvents: IWrapColorBoostEvent[] = [createColorBoostEvent({ time: 10, toggle: true }), createColorBoostEvent({ time: 14, toggle: false })];

		const expectedResult: IBackgroundBox[] = [
			{
				time: 8,
				duration: 2,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
			{
				time: 10,
				duration: 4,
				startState: { color: colorScheme.envColorLeftBoost, brightness: 1 },
				endState: { color: colorScheme.envColorLeftBoost, brightness: 1 },
			},
			{
				time: 14,
				duration: 2,
				startState: { color: colorScheme.envColorLeft, brightness: 1 },
				endState: { color: colorScheme.envColorLeft, brightness: 1 },
			},
		];

		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents, initialLightState: { color: null, brightness: null }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult).toEqual(expectedResult);
	});

	it("handles color boost during a transition", () => {
		// 0  [\\\!\\\]
		const startBeat = 0;
		const numOfBeatsToShow = 8;
		const initialColor = colorScheme.envColorLeft;

		const basicEvents: IWrapBasicEvent[] = [
			createBasicEvent({
				type: 2,
				time: 0,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.ON, color: App.EventColor.PRIMARY }, { tracks }),
				floatValue: 0.0,
			}),
			createBasicEvent({
				type: 2,
				time: 8,
				value: serializeBasicEventValue({ effect: App.BasicEventEffect.TRANSITION, color: App.EventColor.SECONDARY }, { tracks }),
				floatValue: 1.0,
			}),
		];
		const boostEvents: IWrapColorBoostEvent[] = [createColorBoostEvent({ time: 4, toggle: true })];

		const actualResult = createBackgroundBoxes(2, { tracks, colorScheme, basicEvents, boostEvents, initialLightState: { color: initialColor, brightness: 0 }, startBeat, endBeat: startBeat + numOfBeatsToShow });

		expect(actualResult[0]).toEqual({
			time: 0,
			duration: 4,
			startState: {
				color: colorScheme.envColorLeft,
				brightness: 0,
			},
			endState: {
				color: lerpColor(colorScheme.envColorLeft, colorScheme.envColorRight, 0.5),
				brightness: 0.5,
			},
		});
		expect(actualResult[1]).toEqual({
			time: 4,
			duration: 4,
			startState: {
				color: lerpColor(colorScheme.envColorLeftBoost, colorScheme.envColorRightBoost, 0.5),
				brightness: 0.5,
			},
			endState: {
				color: colorScheme.envColorRightBoost,
				brightness: 1,
			},
		});
	});
});
