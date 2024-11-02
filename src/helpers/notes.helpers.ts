import { v1 as uuid } from "uuid";

import { HUMANIZED_DIRECTIONS } from "$/constants";
import { App, Direction, type Json } from "$/types";

type ReduxNote = Json.Note & { selected?: boolean };

// TODO: Currently, the "redux" variant of the blocks format isn't used. I use the proprietary json format everywhere. I want to refactor this, to keep everything in line between blocks, obstacles, and mines.
export function convertBlocksToRedux<T extends Json.Note>(blocks: T[]) {
	return blocks.map((b) => {
		return {
			id: uuid(),
			color: b._type === 0 ? App.SaberColor.LEFT : App.SaberColor.RIGHT,
			direction: HUMANIZED_DIRECTIONS[b._cutDirection],
			beatNum: b._time,
			rowIndex: b._lineLayer,
			colIndex: b._lineIndex,
		};
	});
}

// UNUSED
export function convertBlocksToExportableJson<T extends App.BlockNext>(blocks: T[]) {
	return blocks.map((b) => ({
		_time: b.beatNum,
		_lineIndex: Math.round(b.colIndex),
		_lineLayer: Math.round(b.rowIndex),
		_type: b.color === App.SaberColor.LEFT ? 0 : 1,
		_cutDirection: HUMANIZED_DIRECTIONS.indexOf(b.direction),
	}));
}

export function findNoteByProperties<T extends ReduxNote>(notes: T[], query: { time: number; lineLayer: number; lineIndex: number }) {
	return notes.find((note) => {
		return note._time === query.time && note._lineLayer === query.lineLayer && note._lineIndex === query.lineIndex;
	});
}
export function findNoteIndexByProperties<T extends ReduxNote>(notes: T[], query: { time: number; lineLayer: number; lineIndex: number }) {
	return notes.findIndex((note) => {
		return note._time === query.time && note._lineLayer === query.lineLayer && note._lineIndex === query.lineIndex;
	});
}

function getHorizontallyFlippedCutDirection(cutDirection: Direction) {
	//  4 0 5
	//  2 8 3
	//  6 1 7
	switch (cutDirection) {
		case Direction.UP:
		case Direction.ANY:
		case Direction.DOWN:
			return cutDirection;

		case Direction.UP_LEFT:
		case Direction.LEFT:
		case Direction.DOWN_LEFT:
			return cutDirection + 1;

		case Direction.UP_RIGHT:
		case Direction.RIGHT:
		case Direction.DOWN_RIGHT:
			return cutDirection - 1;

		default:
			throw new Error(`Unrecognized cut direction: ${cutDirection}`);
	}
}
function getVerticallyFlippedCutDirection(cutDirection: Direction) {
	//  4 0 5
	//  2 8 3
	//  6 1 7
	switch (cutDirection) {
		case Direction.LEFT:
		case Direction.ANY:
		case Direction.RIGHT:
			return cutDirection;

		case Direction.UP_LEFT:
		case Direction.UP_RIGHT:
			return cutDirection + 2;

		case Direction.UP:
			return cutDirection + 1;

		case Direction.DOWN:
			return cutDirection - 1;

		case Direction.DOWN_LEFT:
		case Direction.DOWN_RIGHT:
			return cutDirection - 2;

		default:
			throw new Error(`Unrecognized cut direction: ${cutDirection}`);
	}
}

export function swapNotesHorizontally<T extends ReduxNote>(notes: T[]) {
	return notes.map((note) => {
		if (!note.selected) {
			return note;
		}

		// swapping a note means three things:
		// - Moving its lineIndex to the opposite quadrant,
		// - flipping its cutDirection to face the opposite way, and
		// - changing its color
		const newLineIndex = 3 - note._lineIndex;
		const newCutDirection = getHorizontallyFlippedCutDirection(note._cutDirection);
		const newType = note._type === 0 ? 1 : note._type === 1 ? 0 : note._type;

		return {
			...note,
			_lineIndex: newLineIndex,
			_cutDirection: newCutDirection,
			_type: newType,
		};
	});
}

export function swapNotesVertically<T extends ReduxNote>(notes: T[]) {
	return notes.map((note) => {
		if (!note.selected) {
			return note;
		}

		const newLineLayer = 2 - note._lineLayer;
		const newCutDirection = getVerticallyFlippedCutDirection(note._cutDirection);

		return {
			...note,
			_lineLayer: newLineLayer,
			_cutDirection: newCutDirection,
		};
	});
}

export function swapNotes<T extends ReduxNote>(axis: "horizontal" | "vertical", notes: T[]) {
	if (axis === "horizontal") {
		return swapNotesHorizontally(notes);
	}
	return swapNotesVertically(notes);
}

export function nudgeNotes<T extends ReduxNote>(direction: "forwards" | "backwards", amount: number, notes: T[]) {
	const sign = direction === "forwards" ? 1 : -1;

	return notes.map((note) => {
		if (!note.selected) {
			return note;
		}

		return {
			...note,
			_time: note._time + amount * sign,
		};
	});
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
