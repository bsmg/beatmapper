import { getBasicTracksForEnvironment } from "bsmap/environment";
import { describe, expect, it } from "vitest";

import { BasicEventEffect, EventColor } from "$/types";
import { deserializeBasicEventValue, serializeBasicEventValue } from "./events.helpers";

const tracks = getBasicTracksForEnvironment("DefaultEnvironment");

describe("event value serialization", () => {
	describe(serializeBasicEventValue.name, () => {
		it("always returns 0 for trigger events", () => {
			expect(serializeBasicEventValue({ effect: BasicEventEffect.TRIGGER }, { tracks })).toBe(0);
		});
		it("always returns integers for value events", () => {
			expect(serializeBasicEventValue({ effect: BasicEventEffect.VALUE, value: 3 }, { tracks })).toBe(3);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.VALUE, value: 750 }, { tracks })).toBe(750);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.VALUE, value: 2.5 }, { tracks })).toBe(3);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.VALUE }, { tracks })).toBe(0);
		});
		it("always returns 0 for light events when color is nullable", () => {
			expect(serializeBasicEventValue({ effect: BasicEventEffect.OFF }, { tracks })).toBe(0);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.ON, color: null }, { tracks })).toBe(0);
		});
		it("correctly handles all suppored enumerations for light events", () => {
			expect(serializeBasicEventValue({ effect: BasicEventEffect.OFF, color: null }, { tracks })).toBe(0);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.ON, color: EventColor.SECONDARY }, { tracks })).toBe(1);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.FLASH, color: EventColor.SECONDARY }, { tracks })).toBe(2);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.FADE, color: EventColor.SECONDARY }, { tracks })).toBe(3);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.TRANSITION, color: EventColor.SECONDARY }, { tracks })).toBe(4);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.ON, color: EventColor.PRIMARY }, { tracks })).toBe(5);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.FLASH, color: EventColor.PRIMARY }, { tracks })).toBe(6);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.FADE, color: EventColor.PRIMARY }, { tracks })).toBe(7);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.TRANSITION, color: EventColor.PRIMARY }, { tracks })).toBe(8);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.ON, color: EventColor.WHITE }, { tracks })).toBe(9);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.FLASH, color: EventColor.WHITE }, { tracks })).toBe(10);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.FADE, color: EventColor.WHITE }, { tracks })).toBe(11);
			expect(serializeBasicEventValue({ effect: BasicEventEffect.TRANSITION, color: EventColor.WHITE }, { tracks })).toBe(12);
		});
	});
	describe(deserializeBasicEventValue.name, () => {
		it("correctly handles light events", () => {
			expect(deserializeBasicEventValue(1, { tracks, trackId: 0 })).toEqual({
				effect: BasicEventEffect.ON,
				color: EventColor.SECONDARY,
			});
			expect(deserializeBasicEventValue(12, { tracks, trackId: 0 })).toEqual({
				effect: BasicEventEffect.TRANSITION,
				color: EventColor.WHITE,
			});
		});
		it("correctly handles trigger events", () => {
			expect(deserializeBasicEventValue(8602, { tracks, trackId: 8 })).toEqual({
				effect: BasicEventEffect.TRIGGER,
			});
		});
		it("correctly handles value events", () => {
			expect(deserializeBasicEventValue(16, { tracks, trackId: 12 })).toEqual({
				effect: BasicEventEffect.VALUE,
				value: 16,
			});
		});
	});
});
