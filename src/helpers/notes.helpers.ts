import { App, type Json } from "$/types";

export function resolveNoteId<T extends Pick<App.IBaseNote, "beatNum" | "colIndex" | "rowIndex">>(x: T) {
	return `${x.beatNum}-${x.colIndex}-${x.rowIndex}`;
}

export function convertBlocksToRedux<T extends Json.Note>(blocks: T[]): App.ColorNote[] {
	return blocks.map((b) => {
		return {
			id: resolveNoteId({ beatNum: b._time, colIndex: b._lineIndex, rowIndex: b._lineLayer }),
			color: b._type === 0 ? App.SaberColor.LEFT : App.SaberColor.RIGHT,
			direction: Object.values(App.CutDirection)[b._cutDirection],
			beatNum: b._time,
			rowIndex: b._lineLayer,
			colIndex: b._lineIndex,
		};
	});
}
export function convertMinesToRedux<T extends Json.Note>(blocks: T[]): App.BombNote[] {
	return blocks.map((b) => {
		return {
			id: resolveNoteId({ beatNum: b._time, colIndex: b._lineIndex, rowIndex: b._lineLayer }),
			beatNum: b._time,
			rowIndex: b._lineLayer,
			colIndex: b._lineIndex,
		};
	});
}

export function convertBlocksToExportableJson<T extends App.ColorNote>(blocks: T[]): Json.Note[] {
	return blocks.map((b) => ({
		_time: b.beatNum,
		_lineIndex: Math.round(b.colIndex),
		_lineLayer: Math.round(b.rowIndex),
		_type: b.color === App.SaberColor.LEFT ? 0 : 1,
		_cutDirection: Object.values(App.CutDirection).indexOf(b.direction),
	}));
}
export function convertMinesToExportableJson<T extends App.BombNote>(blocks: T[]): Json.Note[] {
	return blocks.map((b) => ({
		_time: b.beatNum,
		_lineIndex: Math.round(b.colIndex),
		_lineLayer: Math.round(b.rowIndex),
		_type: 3,
		_cutDirection: 0,
	}));
}

export function calculateNoteDensity(numOfNotes: number, segmentLengthInBeats: number, bpm: number) {
	if (numOfNotes === 0) {
		return 0;
	}

	const numOfNotesPerBeat = numOfNotes / segmentLengthInBeats;
	const notesPerSecond = numOfNotesPerBeat * (bpm / 60);

	return notesPerSecond;
}

export function convertNotesToMappingExtensions<T extends Pick<Json.Note, "_lineIndex" | "_lineLayer">>(notes: T[]) {
	return notes.map((note) => {
		// Normally, notes go from 0 to 3 for lineIndex, and 0 to 2 for lineLayer. With custom grids, this could be -99 to 99 for both, in theory.
		// But, because we want to support decimal values, we need to switch to the alternate format, where the values omit everything from -999 to 999.
		//   0 -> 1000
		//   1 -> 2000
		//   2 -> 3000
		//  -1 -> -2000
		const newLineIndex = note._lineIndex < 0 ? note._lineIndex * 1000 - 1000 : note._lineIndex * 1000 + 1000;
		const newLineLayer = note._lineLayer < 0 ? note._lineLayer * 1000 - 1000 : note._lineLayer * 1000 + 1000;

		return {
			...note,
			_lineIndex: newLineIndex,
			_lineLayer: newLineLayer,
		};
	});
}

export function convertNotesFromMappingExtensions<T extends Pick<Json.Note, "_lineIndex" | "_lineLayer">>(notes: T[]) {
	return notes.map((note) => {
		// Normally, notes go from 0 to 3 for lineIndex, and 0 to 2 for lineLayer. With custom grids, this could be -99 to 99 for both, in theory.
		// But, because we want to support decimal values, we need to switch to the alternate format, where the values omit everything from -999 to 999.
		//   0 -> 1000
		//   1 -> 2000
		//   2 -> 3000
		//  -1 -> -2000
		const newLineIndex = note._lineIndex < 0 ? note._lineIndex / 1000 + 1 : note._lineIndex / 1000 - 1;
		const newLineLayer = note._lineLayer < 0 ? note._lineLayer / 1000 + 1 : note._lineLayer / 1000 - 1;

		return {
			...note,
			_lineIndex: newLineIndex,
			_lineLayer: newLineLayer,
		};
	});
}
