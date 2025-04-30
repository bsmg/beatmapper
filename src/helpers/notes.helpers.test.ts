import { nanoid } from "@reduxjs/toolkit";
import { type container, v2, v3 } from "bsmap/types";
import { describe, expect, it } from "vitest";

import { App } from "$/types";
import { calculateNoteDensity, deserializeBombNote, deserializeColorNote, resolveNoteId, serializeBombNote, serializeColorNote } from "./notes.helpers";

describe("serialization", () => {
	describe("color notes (vanilla)", () => {
		const wrapper: App.ColorNote[] = [
			{ id: nanoid(), color: App.SaberColor.LEFT, direction: App.CutDirection.DOWN, beatNum: 2, rowIndex: 0, colIndex: 2 },
			{ id: nanoid(), color: App.SaberColor.RIGHT, direction: App.CutDirection.UP, beatNum: 3.5, rowIndex: 0, colIndex: 3 },
		];
		describe("v2", () => {
			const v2: v2.INote[] = [
				{ _time: 2, _lineIndex: 2, _lineLayer: 0, _type: 0, _cutDirection: 1 },
				{ _time: 3.5, _lineIndex: 3, _lineLayer: 0, _type: 1, _cutDirection: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeColorNote(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeColorNote(2, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			});
		});
		describe("v3", () => {
			const v3: v3.IColorNote[] = [
				{ b: 2, x: 2, y: 0, c: 0, d: 1, a: 0 },
				{ b: 3.5, x: 3, y: 0, c: 1, d: 0, a: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeColorNote(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeColorNote(3, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			});
		});
		describe("v4", () => {
			const v4: container.v4.IColorNoteContainer[] = [
				{ object: { b: 2 }, data: { x: 2, y: 0, c: 0, d: 1, a: 0 } },
				{ object: { b: 3.5 }, data: { x: 3, y: 0, c: 1, d: 0, a: 0 } },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeColorNote(4, x, {}))).toEqual(v4);
			});
			it("converts from serial to wrapper", () => {
				expect(v4.map((x) => deserializeColorNote(4, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			});
		});
	});
	describe("bomb notes (vanilla)", () => {
		const wrapper: App.BombNote[] = [
			{ id: nanoid(), beatNum: 2, rowIndex: 0, colIndex: 2 },
			{ id: nanoid(), beatNum: 3.5, rowIndex: 0, colIndex: 3 },
		];
		describe("v2", () => {
			const v2: v2.INote[] = [
				{ _time: 2, _lineIndex: 2, _lineLayer: 0, _type: 3, _cutDirection: 0 },
				{ _time: 3.5, _lineIndex: 3, _lineLayer: 0, _type: 3, _cutDirection: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBombNote(2, x, {}))).toEqual(v2);
			});
			it("converts from serial to wrapper", () => {
				expect(v2.map((x) => deserializeBombNote(2, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			});
		});
		describe("v3", () => {
			const v3: v3.IBombNote[] = [
				{ b: 2, x: 2, y: 0 },
				{ b: 3.5, x: 3, y: 0 },
				//
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBombNote(3, x, {}))).toEqual(v3);
			});
			it("converts from serial to wrapper", () => {
				expect(v3.map((x) => deserializeBombNote(3, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			});
		});
		describe("v4", () => {
			const v4: container.v4.IBombNoteContainer[] = [
				{ object: { b: 2 }, data: { x: 2, y: 0 } },
				{ object: { b: 3.5 }, data: { x: 3, y: 0 } },
			];
			it("converts from wrapper to serial", () => {
				expect(wrapper.map((x) => serializeBombNote(4, x, {}))).toEqual(v4);
			});
			it("converts from serial to wrapper", () => {
				expect(v4.map((x) => deserializeBombNote(4, x, {}))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			});
		});
	});
	describe("notes (mapping extensions)", () => {
		const wrapper: App.BombNote[] = [
			{ id: nanoid(), beatNum: 4, colIndex: 0, rowIndex: 0 },
			{ id: nanoid(), beatNum: 4, colIndex: 1.5, rowIndex: 2 },
			{ id: nanoid(), beatNum: 6, colIndex: -0.5, rowIndex: 1 },
			{ id: nanoid(), beatNum: 8, colIndex: 10, rowIndex: -2.25 },
		];
		it("converts full circle to wrapper", () => {
			const options = { extensionsProvider: "mapping-extensions" } as const;
			expect(wrapper.map((x) => deserializeBombNote(2, serializeBombNote(2, x, options), options))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			expect(wrapper.map((x) => deserializeBombNote(3, serializeBombNote(3, x, options), options))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
			expect(wrapper.map((x) => deserializeBombNote(4, serializeBombNote(4, x, options), options))).toEqual(wrapper.map((x) => ({ ...x, id: resolveNoteId(x) })));
		});
	});
});

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
