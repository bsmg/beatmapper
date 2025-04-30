import { v1, v2, v3, v4 } from "bsmap";
import type { container, v1 as v1t, v2 as v2t, v3 as v3t } from "bsmap/types";
import { object } from "valibot";

import { App } from "$/types";
import { type BeatmapEntitySerializationOptions, MAPPING_EXTENSIONS_INDEX_RESOLVERS, createCoordinateSerializationFactory } from "./object.helpers";
import { createSerializationFactory } from "./serialization.helpers";

export function resolveNoteId<T extends Pick<App.IBaseNote, "beatNum" | "colIndex" | "rowIndex">>(x: T) {
	return `${x.beatNum}/${x.colIndex}/${x.rowIndex}`;
}

const { serialize: serializeColIndex, deserialize: deserializeColIndex } = createCoordinateSerializationFactory({ min: 0, max: 3, extensions: { "mapping-extensions": MAPPING_EXTENSIONS_INDEX_RESOLVERS } });
const { serialize: serializeRowIndex, deserialize: deserializeRowIndex } = createCoordinateSerializationFactory({ min: 0, max: 2, extensions: { "mapping-extensions": MAPPING_EXTENSIONS_INDEX_RESOLVERS } });

type SharedOptions = [BeatmapEntitySerializationOptions<"mapping-extensions">, {}, {}, {}, {}];

export const { serialize: serializeColorNote, deserialize: deserializeColorNote } = createSerializationFactory<App.ColorNote, [v1t.INote, v2t.INote, v3t.IColorNote, container.v4.IColorNoteContainer], SharedOptions, SharedOptions>("ColorNote", () => {
	return {
		1: {
			schema: v1.NoteSchema,
			container: {
				serialize: (data, options) => {
					return {
						_time: data.beatNum,
						_lineIndex: serializeColIndex(data.colIndex, options),
						_lineLayer: serializeRowIndex(data.rowIndex, options),
						_type: Object.values(App.SaberColor).indexOf(data.color) as 0 | 1,
						_cutDirection: Object.values(App.CutDirection).indexOf(data.direction),
					};
				},
				deserialize: (data, options) => {
					const colIndex = deserializeColIndex(data._lineIndex ?? 0, options);
					const rowIndex = deserializeRowIndex(data._lineLayer ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: data._time ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: data._time ?? 0,
						colIndex: deserializeColIndex(data._lineIndex ?? 0, options),
						rowIndex: deserializeRowIndex(data._lineLayer ?? 0, options),
						color: Object.values(App.SaberColor)[data._type ?? 0],
						direction: Object.values(App.CutDirection)[data._cutDirection ?? 0],
					};
				},
			},
		},
		2: {
			schema: v2.NoteSchema,
			container: {
				serialize: (data, options) => {
					return {
						_time: data.beatNum,
						_lineIndex: serializeColIndex(data.colIndex, options),
						_lineLayer: serializeRowIndex(data.rowIndex, options),
						_type: Object.values(App.SaberColor).indexOf(data.color) as 0 | 1,
						_cutDirection: Object.values(App.CutDirection).indexOf(data.direction),
					};
				},
				deserialize: (data, options) => {
					const colIndex = deserializeColIndex(data._lineIndex ?? 0, options);
					const rowIndex = deserializeRowIndex(data._lineLayer ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: data._time ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: data._time ?? 0,
						colIndex: deserializeColIndex(data._lineIndex ?? 0, options),
						rowIndex: deserializeRowIndex(data._lineLayer ?? 0, options),
						color: Object.values(App.SaberColor)[data._type ?? 0],
						direction: Object.values(App.CutDirection)[data._cutDirection ?? 0],
					};
				},
			},
		},
		3: {
			schema: v3.ColorNoteSchema,
			container: {
				serialize: (data, options) => {
					return {
						b: data.beatNum,
						x: serializeColIndex(data.colIndex, options),
						y: serializeRowIndex(data.rowIndex, options),
						c: Object.values(App.SaberColor).indexOf(data.color) as 0 | 1,
						d: Object.values(App.CutDirection).indexOf(data.direction),
						a: 0,
					};
				},
				deserialize: (data, options) => {
					const colIndex = deserializeColIndex(data.x ?? 0, options);
					const rowIndex = deserializeRowIndex(data.y ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: data.b ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: data.b ?? 0,
						colIndex: colIndex,
						rowIndex: rowIndex,
						color: Object.values(App.SaberColor)[data.c ?? 0],
						direction: Object.values(App.CutDirection)[data.d ?? 0],
					};
				},
			},
		},
		4: {
			schema: object({ object: v4.ObjectLaneSchema, data: v4.ColorNoteSchema }),
			container: {
				serialize: (data, options) => {
					return {
						object: { b: data.beatNum },
						data: {
							x: serializeColIndex(data.colIndex, options),
							y: serializeRowIndex(data.rowIndex, options),
							c: Object.values(App.SaberColor).indexOf(data.color) as 0 | 1,
							d: Object.values(App.CutDirection).indexOf(data.direction),
							a: 0,
						},
					};
				},
				deserialize: ({ object, data }, options) => {
					const colIndex = deserializeColIndex(data.x ?? 0, options);
					const rowIndex = deserializeRowIndex(data.y ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: object.b ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: object.b ?? 0,
						colIndex: colIndex,
						rowIndex: rowIndex,
						color: Object.values(App.SaberColor)[data.c ?? 0],
						direction: Object.values(App.CutDirection)[data.d ?? 0],
					};
				},
			},
		},
	};
});

export const { serialize: serializeBombNote, deserialize: deserializeBombNote } = createSerializationFactory<App.BombNote, [v1t.INote, v2t.INote, v3t.IBombNote, container.v4.IBombNoteContainer], SharedOptions, SharedOptions>("BombNote", () => {
	return {
		1: {
			schema: v1.NoteSchema,
			container: {
				serialize: (data, options) => {
					return {
						_time: data.beatNum,
						_lineIndex: serializeColIndex(data.colIndex, options),
						_lineLayer: serializeRowIndex(data.rowIndex, options),
						_type: 3,
						_cutDirection: 0,
					};
				},
				deserialize: (data, options) => {
					const colIndex = deserializeColIndex(data._lineIndex ?? 0, options);
					const rowIndex = deserializeRowIndex(data._lineLayer ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: data._time ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: data._time ?? 0,
						colIndex: colIndex,
						rowIndex: rowIndex,
					};
				},
			},
		},
		2: {
			schema: v2.NoteSchema,
			container: {
				serialize: (data, options) => {
					return {
						_time: data.beatNum,
						_lineIndex: serializeColIndex(data.colIndex, options),
						_lineLayer: serializeRowIndex(data.rowIndex, options),
						_type: 3,
						_cutDirection: 0,
					};
				},
				deserialize: (data, options) => {
					const colIndex = deserializeColIndex(data._lineIndex ?? 0, options);
					const rowIndex = deserializeRowIndex(data._lineLayer ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: data._time ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: data._time ?? 0,
						colIndex: colIndex,
						rowIndex: rowIndex,
					};
				},
			},
		},
		3: {
			schema: v3.BombNoteSchema,
			container: {
				serialize: (data, options) => {
					return {
						b: data.beatNum,
						x: serializeColIndex(data.colIndex, options),
						y: serializeRowIndex(data.rowIndex, options),
					};
				},
				deserialize: (data, options) => {
					const colIndex = deserializeColIndex(data.x ?? 0, options);
					const rowIndex = deserializeRowIndex(data.y ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: data.b ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: data.b ?? 0,
						colIndex: colIndex,
						rowIndex: rowIndex,
					};
				},
			},
		},
		4: {
			schema: object({ object: v4.ObjectLaneSchema, data: v4.BombNoteSchema }),
			container: {
				serialize: (data, options) => {
					return {
						object: { b: data.beatNum },
						data: {
							x: serializeColIndex(data.colIndex, options),
							y: serializeRowIndex(data.rowIndex, options),
						},
					};
				},
				deserialize: ({ object, data }, options) => {
					const colIndex = deserializeColIndex(data.x ?? 0, options);
					const rowIndex = deserializeRowIndex(data.y ?? 0, options);
					return {
						id: resolveNoteId({ beatNum: object.b ?? 0, colIndex: colIndex, rowIndex: rowIndex }),
						beatNum: object.b ?? 0,
						colIndex: colIndex,
						rowIndex: rowIndex,
					};
				},
			},
		},
	};
});

export function calculateNoteDensity(numOfNotes: number, segmentLengthInBeats: number, bpm: number) {
	if (numOfNotes === 0) {
		return 0;
	}

	const numOfNotesPerBeat = numOfNotes / segmentLengthInBeats;
	const notesPerSecond = numOfNotesPerBeat * (bpm / 60);

	return notesPerSecond;
}
