import type { v2 } from "bsmap/types";
import { describe, expect, it } from "vitest";

import { App } from "$/types";
import { omit } from "$/utils";
import { convertEventsToExportableJson, convertEventsToRedux } from "./events.helpers";

describe("Event helpers", () => {
	describe("Converting from redux to v2 json", () => {
		it("converts a lighting event", () => {
			const events: App.BasicEvent[] = [
				{
					id: "abc",
					trackId: App.TrackId[4],
					beatNum: 12,
					type: App.BasicEventType.ON,
					colorType: App.EventColor.PRIMARY,
				},
			];

			const actualResult = convertEventsToExportableJson(events);
			const expectedResult: v2.IEvent[] = [
				{
					_time: 12,
					_type: 4, // track ID
					_value: 5, // event type (red on)
				},
			];

			expect(actualResult).toEqual(expectedResult);
		});

		it("converts multiple lighting event", () => {
			const events: App.BasicEvent[] = [
				{
					id: "abc",
					trackId: App.TrackId[2],
					beatNum: 1,
					type: App.BasicEventType.FLASH,
					colorType: App.EventColor.PRIMARY,
				},
				{
					id: "def",
					trackId: App.TrackId[2],
					beatNum: 2,
					type: App.BasicEventType.OFF,
				},
				{
					id: "ghi",
					trackId: App.TrackId[3],
					beatNum: 2,
					type: App.BasicEventType.FLASH,
					colorType: App.EventColor.SECONDARY,
				},
				{
					id: "jkl",
					trackId: App.TrackId[3],
					beatNum: 3,
					type: App.BasicEventType.OFF,
				},
			];

			const actualResult = convertEventsToExportableJson(events);
			const expectedResult: v2.IEvent[] = [
				{ _time: 1, _type: 2, _value: 6 },
				{ _time: 2, _type: 2, _value: 0 },
				{ _time: 2, _type: 3, _value: 2 },
				{ _time: 3, _type: 3, _value: 0 },
			];

			expect(actualResult).toEqual(expectedResult);
		});

		it("converts laser speed and rotation events", () => {
			const events: App.BasicEvent[] = [
				{
					id: "abc",
					trackId: App.TrackId[9],
					beatNum: 1,
					type: App.BasicEventType.TRIGGER,
				},
				{
					id: "abc",
					trackId: App.TrackId[8],
					beatNum: 1,
					type: App.BasicEventType.TRIGGER,
				},
				{
					id: "abc",
					trackId: App.TrackId[12],
					beatNum: 2,
					type: App.BasicEventType.VALUE,
					laserSpeed: 8,
				},
				{
					id: "abc",
					trackId: App.TrackId[13],
					beatNum: 2,
					type: App.BasicEventType.VALUE,
					laserSpeed: 2,
				},
			];
			const actualResult = convertEventsToExportableJson(events);
			const expectedResult = [
				{ _time: 1, _type: 9, _value: 0 },
				{ _time: 1, _type: 8, _value: 0 },
				{ _time: 2, _type: 12, _value: 8 },
				{ _time: 2, _type: 13, _value: 2 },
			];
			expect(actualResult).toEqual(expectedResult);
		});
	});

	describe("Converting from v2 json to redux", () => {
		it("converts a lighting event", () => {
			const events: v2.IEvent[] = [
				{
					_time: 12,
					_type: 4, // track ID
					_value: 5, // event type (red on)
				},
			];

			const actualResult = convertEventsToRedux(events);
			for (const result of actualResult) {
				expect(typeof result.id).toEqual("string");
			}
			const expectedResult: App.BasicEvent[] = [
				{
					id: "abc",
					trackId: App.TrackId[4],
					beatNum: 12,
					type: App.BasicEventType.ON,
					colorType: App.EventColor.PRIMARY,
				},
			];
			// We can't just compare actual to expected because IDs are randomly generated within the method :/
			expect(actualResult.map((x) => omit(x, "id"))).toEqual(expectedResult.map((x) => omit(x, "id")));
		});

		it("converts multiple lighting event", () => {
			const events: v2.IEvent[] = [
				{ _time: 1, _type: 2, _value: 6 },
				{ _time: 2, _type: 2, _value: 0 },
				{ _time: 2, _type: 3, _value: 2 },
				{ _time: 3, _type: 3, _value: 0 },
			];

			const actualResult = convertEventsToRedux(events);
			for (const result of actualResult) {
				expect(typeof result.id).toEqual("string");
			}
			const expectedResult = [
				{
					id: "abc",
					trackId: App.TrackId[2],
					beatNum: 1,
					type: App.BasicEventType.FLASH,
					colorType: App.EventColor.PRIMARY,
				},
				{
					id: "def",
					trackId: App.TrackId[2],
					beatNum: 2,
					type: App.BasicEventType.OFF,
				},
				{
					id: "ghi",
					trackId: App.TrackId[3],
					beatNum: 2,
					type: App.BasicEventType.FLASH,
					colorType: App.EventColor.SECONDARY,
				},
				{
					id: "jkl",
					trackId: App.TrackId[3],
					beatNum: 3,
					type: App.BasicEventType.OFF,
				},
			];

			expect(actualResult.map((x) => omit(x, "id"))).toEqual(expectedResult.map((x) => omit(x, "id")));
		});

		it("converts laser speed and rotation events", () => {
			const events: v2.IEvent[] = [
				{ _time: 1, _type: 9, _value: 0 },
				{ _time: 1, _type: 8, _value: 0 },
				{ _time: 2, _type: 12, _value: 8 },
				{ _time: 2, _type: 13, _value: 2 },
			];

			const actualResult = convertEventsToRedux(events);
			for (const result of actualResult) {
				expect(typeof result.id).toEqual("string");
			}
			const expectedResult: App.BasicEvent[] = [
				{
					id: "abc",
					trackId: App.TrackId[9],
					beatNum: 1,
					type: App.BasicEventType.TRIGGER,
				},
				{
					id: "abc",
					trackId: App.TrackId[8],
					beatNum: 1,
					type: App.BasicEventType.TRIGGER,
				},
				{
					id: "abc",
					trackId: App.TrackId[12],
					beatNum: 2,
					type: App.BasicEventType.VALUE,
					laserSpeed: 8,
				},
				{
					id: "abc",
					trackId: App.TrackId[13],
					beatNum: 2,
					type: App.BasicEventType.VALUE,
					laserSpeed: 2,
				},
			];
			expect(actualResult.map((x) => omit(x, "id"))).toEqual(expectedResult.map((x) => omit(x, "id")));
		});
	});
});
