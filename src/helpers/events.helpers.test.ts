import { nanoid } from "@reduxjs/toolkit";
import type { container, v2 as v2t, v3 as v3t } from "bsmap/types";
import { describe, expect, it } from "vitest";

import { App } from "$/types";
import { deserializeBasicEvent, resolveEventId, serializeBasicEvent } from "./events.helpers";

describe("serialization", () => {
	describe("basic events (light)", () => {
		const wrapper: App.IBasicLightEvent[] = [
			{ id: nanoid(), trackId: App.TrackId[2], beatNum: 1, type: App.BasicEventType.FLASH, colorType: App.EventColor.PRIMARY },
			{ id: nanoid(), trackId: App.TrackId[2], beatNum: 2, type: App.BasicEventType.OFF },
			{ id: nanoid(), trackId: App.TrackId[3], beatNum: 2, type: App.BasicEventType.FLASH, colorType: App.EventColor.SECONDARY },
			{ id: nanoid(), trackId: App.TrackId[3], beatNum: 3, type: App.BasicEventType.OFF },
		];
		describe("v2", () => {
			const v2: v2t.IEvent[] = [
				{ _time: 1, _type: 2, _value: 6, _floatValue: 1 },
				{ _time: 2, _type: 2, _value: 0, _floatValue: 1 },
				{ _time: 2, _type: 3, _value: 2, _floatValue: 1 },
				{ _time: 3, _type: 3, _value: 0, _floatValue: 1 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeBasicEvent(2, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
		describe("v3", () => {
			const v3: v3t.IBasicEvent[] = [
				{ b: 1, et: 2, i: 6, f: 1 },
				{ b: 2, et: 2, i: 0, f: 1 },
				{ b: 2, et: 3, i: 2, f: 1 },
				{ b: 3, et: 3, i: 0, f: 1 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeBasicEvent(3, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
		describe("v4", () => {
			const v4: container.v4.IBasicEventContainer[] = [
				{ object: { b: 1 }, data: { t: 2, i: 6, f: 1 } },
				{ object: { b: 2 }, data: { t: 2, i: 0, f: 1 } },
				{ object: { b: 2 }, data: { t: 3, i: 2, f: 1 } },
				{ object: { b: 3 }, data: { t: 3, i: 0, f: 1 } },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(4, x, {}))).toEqual(v4);
			});
			it("converts from serial to wrapper", () => {
				expect(v4.map((x) => deserializeBasicEvent(4, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
	});
	describe("basic events (trigger)", () => {
		const wrapper: App.IBasicTriggerEvent[] = [
			{ id: nanoid(), trackId: App.TrackId[8], beatNum: 1, type: App.BasicEventType.TRIGGER },
			{ id: nanoid(), trackId: App.TrackId[9], beatNum: 1, type: App.BasicEventType.TRIGGER },
		];
		describe("v2", () => {
			const v2: v2t.IEvent[] = [
				{ _time: 1, _type: 8, _value: 0, _floatValue: 0 },
				{ _time: 1, _type: 9, _value: 0, _floatValue: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeBasicEvent(2, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
		describe("v3", () => {
			const v3: v3t.IBasicEvent[] = [
				{ b: 1, et: 8, i: 0, f: 0 },
				{ b: 1, et: 9, i: 0, f: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeBasicEvent(3, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
		describe("v4", () => {
			const v4: container.v4.IBasicEventContainer[] = [
				{ object: { b: 1 }, data: { t: 8, i: 0, f: 0 } },
				{ object: { b: 1 }, data: { t: 9, i: 0, f: 0 } },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(4, x, {}))).toEqual(v4);
			});
			it("converts from serial to wrapper", () => {
				expect(v4.map((x) => deserializeBasicEvent(4, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
	});
	describe("basic events (value)", () => {
		const wrapper: App.IBasicValueEvent[] = [
			{ id: nanoid(), trackId: App.TrackId[12], beatNum: 2, type: App.BasicEventType.VALUE, laserSpeed: 8 },
			{ id: nanoid(), trackId: App.TrackId[13], beatNum: 2, type: App.BasicEventType.VALUE, laserSpeed: 2 },
		];
		describe("v2", () => {
			const v2: v2t.IEvent[] = [
				{ _time: 2, _type: 12, _value: 8, _floatValue: 0 },
				{ _time: 2, _type: 13, _value: 2, _floatValue: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeBasicEvent(2, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
		describe("v3", () => {
			const v3: v3t.IBasicEvent[] = [
				{ b: 2, et: 12, i: 8, f: 0 },
				{ b: 2, et: 13, i: 2, f: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeBasicEvent(3, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
		describe("v4", () => {
			const v4: container.v4.IBasicEventContainer[] = [
				{ object: { b: 2 }, data: { t: 12, i: 8, f: 0 } },
				{ object: { b: 2 }, data: { t: 13, i: 2, f: 0 } },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBasicEvent(4, x, {}))).toEqual(v4);
			});
			it("converts from serial to wrapper", () => {
				expect(v4.map((x) => deserializeBasicEvent(4, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveEventId(x) })));
			});
		});
	});
});
