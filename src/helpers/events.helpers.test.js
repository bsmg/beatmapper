import { App } from "$/types";
import { describe, expect, it } from "vitest";
import { convertEventsToExportableJson, convertEventsToRedux } from "./events.helpers";

describe("Event helpers", () => {
	describe("Converting from redux to v2 json", () => {
		it("converts a lighting event", () => {
			const events = [
				{
					id: "abc",
					trackId: App.TrackId[4],
					beatNum: 12,
					type: App.EventType.ON,
					colorType: App.EventColorType.PRIMARY,
				},
			];

			const actualResult = convertEventsToExportableJson(events);
			const expectedResult = [
				{
					_time: 12,
					_type: 4, // track ID
					_value: 5, // event type (red on)
				},
			];

			expect(actualResult).toEqual(expectedResult);
		});

		it("converts multiple lighting event", () => {
			const events = [
				{
					id: "abc",
					trackId: App.TrackId[2],
					beatNum: 1,
					type: App.EventType.FLASH,
					colorType: App.EventColorType.PRIMARY,
				},
				{
					id: "def",
					trackId: App.TrackId[2],
					beatNum: 2,
					type: App.EventType.OFF,
				},
				{
					id: "ghi",
					trackId: App.TrackId[3],
					beatNum: 2,
					type: App.EventType.FLASH,
					colorType: App.EventColorType.SECONDARY,
				},
				{
					id: "jkl",
					trackId: App.TrackId[3],
					beatNum: 3,
					type: App.EventType.OFF,
				},
			];

			const actualResult = convertEventsToExportableJson(events);
			const expectedResult = [
				{ _time: 1, _type: 2, _value: 6 },
				{ _time: 2, _type: 2, _value: 0 },
				{ _time: 2, _type: 3, _value: 2 },
				{ _time: 3, _type: 3, _value: 0 },
			];

			expect(actualResult).toEqual(expectedResult);
		});

		it("converts laser speed and rotation events", () => {
			const events = [
				{
					id: "abc",
					trackId: App.TrackId[9],
					beatNum: 1,
				},
				{
					id: "abc",
					trackId: App.TrackId[8],
					beatNum: 1,
				},
				{
					id: "abc",
					trackId: App.TrackId[12],
					beatNum: 2,
					laserSpeed: 8,
				},
				{
					id: "abc",
					trackId: App.TrackId[13],
					beatNum: 2,
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

	// We can't just compare actual to expected because IDs are randomly
	// generated within the method :/
	const compareExceptId = (actual, expected) => {
		const actualClone = actual.map((ev) => {
			const clone = { ...ev };
			clone.id = undefined;
			return clone;
		});
		const expectedClone = expected.map((ev) => {
			const clone = { ...ev };
			clone.id = undefined;
			return clone;
		});

		expect(actualClone).toEqual(expectedClone);
	};

	describe("Converting from v2 json to redux", () => {
		it("converts a lighting event", () => {
			const events = [
				{
					_time: 12,
					_type: 4, // track ID
					_value: 5, // event type (red on)
				},
			];

			const actualResult = convertEventsToRedux(events);
			const expectedResult = [
				{
					id: "abc",
					trackId: App.TrackId[4],
					beatNum: 12,
					type: App.EventType.ON,
					colorType: App.EventColorType.PRIMARY,
				},
			];

			compareExceptId(actualResult, expectedResult);
		});

		it("converts multiple lighting event", () => {
			const events = [
				{ _time: 1, _type: 2, _value: 6 },
				{ _time: 2, _type: 2, _value: 0 },
				{ _time: 2, _type: 3, _value: 2 },
				{ _time: 3, _type: 3, _value: 0 },
			];

			const actualResult = convertEventsToRedux(events);
			const expectedResult = [
				{
					id: "abc",
					trackId: App.TrackId[2],
					beatNum: 1,
					type: App.EventType.FLASH,
					colorType: App.EventColorType.PRIMARY,
				},
				{
					id: "def",
					trackId: App.TrackId[2],
					beatNum: 2,
					type: App.EventType.OFF,
				},
				{
					id: "ghi",
					trackId: App.TrackId[3],
					beatNum: 2,
					type: App.EventType.FLASH,
					colorType: App.EventColorType.SECONDARY,
				},
				{
					id: "jkl",
					trackId: App.TrackId[3],
					beatNum: 3,
					type: App.EventType.OFF,
				},
			];

			compareExceptId(actualResult, expectedResult);
		});

		it("converts laser speed and rotation events", () => {
			const events = [
				{ _time: 1, _type: 9, _value: 0 },
				{ _time: 1, _type: 8, _value: 0 },
				{ _time: 2, _type: 12, _value: 8 },
				{ _time: 2, _type: 13, _value: 2 },
			];

			const actualResult = convertEventsToRedux(events);
			const expectedResult = [
				{
					id: "abc",
					trackId: App.TrackId[9],
					beatNum: 1,
					type: App.EventType.TRIGGER,
				},
				{
					id: "abc",
					trackId: App.TrackId[8],
					beatNum: 1,
					type: App.EventType.TRIGGER,
				},
				{
					id: "abc",
					trackId: App.TrackId[12],
					beatNum: 2,
					laserSpeed: 8,
				},
				{
					id: "abc",
					trackId: App.TrackId[13],
					beatNum: 2,
					laserSpeed: 2,
				},
			];
			compareExceptId(actualResult, expectedResult);
		});
	});
});
