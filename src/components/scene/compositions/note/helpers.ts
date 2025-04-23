import { blockCenterUrl, blockDirectionalUrl } from "$/assets";
import { BLOCK_COLUMN_WIDTH, SONG_OFFSET } from "$/components/scene/constants";
import { CutDirection } from "$/types";
import { convertDegreesToRadians } from "$/utils";

export function resolvePathForNoteDirection(direction: CutDirection) {
	// If the direction is >=1000, that means it's a MappingExtensions thing.
	// Must be directional.
	if (direction >= 1000) {
		return blockDirectionalUrl;
	}

	switch (direction) {
		case CutDirection.UP:
		case CutDirection.DOWN:
		case CutDirection.LEFT:
		case CutDirection.RIGHT:
		case CutDirection.UP_LEFT:
		case CutDirection.UP_RIGHT:
		case CutDirection.DOWN_LEFT:
		case CutDirection.DOWN_RIGHT: {
			return blockDirectionalUrl;
		}
		case CutDirection.ANY: {
			return blockCenterUrl;
		}
		default: {
			throw new Error(`Unrecognized direction: ${direction}`);
		}
	}
}

export function resolveRotationForNoteDirection(direction: CutDirection) {
	// If the rotation is >=1000, we're in MappingExtensions land :D
	// It uses a 1000-1360 system, from down clockwise.
	// We have some conversions to do, to get an angle in radians.
	if (direction >= 1000) {
		// (this formula is a little bonkers, there's probably a simpler way.)
		// (but it works.)
		const reorientedAngle = 180 - ((direction + 270) % 360);
		const angleInRads = convertDegreesToRadians(reorientedAngle);

		return angleInRads;
	}

	// The numbering system used is completely nonsensical:
	//
	//   4  0  5
	//   2  8  3
	//   6  1  7
	//
	// Our block by default points downwards, so we'll do x-axis rotations depending on the number
	switch (direction) {
		case CutDirection.UP: {
			return Math.PI;
		}
		case CutDirection.DOWN: {
			return 0;
		}
		case CutDirection.LEFT: {
			return Math.PI * -0.5;
		}
		case CutDirection.RIGHT: {
			return Math.PI * 0.5;
		}
		case CutDirection.UP_LEFT: {
			return Math.PI * -0.75;
		}
		case CutDirection.UP_RIGHT: {
			return Math.PI * 0.75;
		}
		case CutDirection.DOWN_LEFT: {
			return Math.PI * -0.25;
		}
		case CutDirection.DOWN_RIGHT: {
			return Math.PI * 0.25;
		}

		case CutDirection.ANY: {
			return 0;
		}

		default: {
			throw new Error(`Unrecognized direction: ${direction}`);
		}
	}
}

export function resolvePositionForNote<T extends { beatNum?: number; colIndex: number; rowIndex: number }>(note: T, beatDepth?: number) {
	const x = note.colIndex * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH * 1.5;
	const y = note.rowIndex * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH;

	let z = -SONG_OFFSET;

	if (note.beatNum && beatDepth) {
		// We want to first lay the notes out with proper spacing between them.
		// beatDepth controls the distance between two 1/4 notes.
		// We want this to all be BPM-independent; two quarter notes should be equally distant regardless of BPM. To do this, we have to convert the note time into notes.
		// First, get the note's "starting" position. Where it is when the song is at 0:00
		const startingPosition = note.beatNum * beatDepth * -1;

		// Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
		z += startingPosition;
	}

	return { x, y, z };
}
