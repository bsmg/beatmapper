import { NoteDirection } from "bsmap";

import { blockCenterUrl, blockDirectionalUrl } from "$/assets";
import { BLOCK_COLUMN_WIDTH, SONG_OFFSET } from "$/components/scene/constants";
import type { App } from "$/types";
import { convertDegreesToRadians } from "$/utils";

export function resolvePathForNoteDirection(direction: number) {
	// If the direction is >=1000, that means it's a MappingExtensions thing.
	// Must be directional.
	if (direction >= 1000) {
		return blockDirectionalUrl;
	}

	switch (direction) {
		case NoteDirection.UP:
		case NoteDirection.DOWN:
		case NoteDirection.LEFT:
		case NoteDirection.RIGHT:
		case NoteDirection.UP_LEFT:
		case NoteDirection.UP_RIGHT:
		case NoteDirection.DOWN_LEFT:
		case NoteDirection.DOWN_RIGHT: {
			return blockDirectionalUrl;
		}
		case NoteDirection.ANY: {
			return blockCenterUrl;
		}
		default: {
			throw new Error(`Unrecognized direction: ${direction}`);
		}
	}
}

export function resolveRotationForNoteDirection(direction: number) {
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
		case NoteDirection.UP: {
			return Math.PI;
		}
		case NoteDirection.DOWN: {
			return 0;
		}
		case NoteDirection.LEFT: {
			return Math.PI * -0.5;
		}
		case NoteDirection.RIGHT: {
			return Math.PI * 0.5;
		}
		case NoteDirection.UP_LEFT: {
			return Math.PI * -0.75;
		}
		case NoteDirection.UP_RIGHT: {
			return Math.PI * 0.75;
		}
		case NoteDirection.DOWN_LEFT: {
			return Math.PI * -0.25;
		}
		case NoteDirection.DOWN_RIGHT: {
			return Math.PI * 0.25;
		}

		case NoteDirection.ANY: {
			return 0;
		}

		default: {
			throw new Error(`Unrecognized direction: ${direction}`);
		}
	}
}

export function resolvePositionForNote<T extends Pick<App.IBaseNote, "posX" | "posY"> & Partial<Pick<App.IBaseNote, "time">>>(note: T, beatDepth?: number) {
	const x = note.posX * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH * 1.5;
	const y = note.posY * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH;

	let z = -SONG_OFFSET;

	if (note.time && beatDepth) {
		// We want to first lay the notes out with proper spacing between them.
		// beatDepth controls the distance between two 1/4 notes.
		// We want this to all be BPM-independent; two quarter notes should be equally distant regardless of BPM. To do this, we have to convert the note time into notes.
		// First, get the note's "starting" position. Where it is when the song is at 0:00
		const startingPosition = note.time * beatDepth * -1;

		// Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
		z += startingPosition;
	}

	return { x, y, z };
}
