import { NoteDirection } from "bsmap";
import type { Vector3Tuple } from "three";

import { blockCenterUrl, blockDirectionalUrl } from "$/assets";
import { BLOCK_CELL_SIZE, SONG_OFFSET } from "$/components/scene/constants";
import type { App } from "$/types";
import { convertDegreesToRadians } from "$/utils";

export function resolvePathForNoteDirection(direction: number) {
	// If the direction is >=1000, we'll want to use mapping extensions.
	// - for 2000-2360 range, it should be a dot note
	if (direction >= 2000) return blockCenterUrl;
	// - for 1000-1360 range, it should be directional
	if (direction >= 1000) return blockDirectionalUrl;

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

interface Options {
	beatDepth?: number;
}
export function resolvePositionForNote<T extends Pick<App.IBaseNote, "posX" | "posY"> & Partial<Pick<App.IBaseNote, "time">>>(note: T, { beatDepth }: Options): Vector3Tuple {
	const position = { x: 0, y: 0, z: 0 };

	if (note.posX >= 1000 || note.posX <= -1000) {
		const OFFSET_X = BLOCK_CELL_SIZE * -1.5;
		position.x = (note.posX / 1000) * BLOCK_CELL_SIZE + OFFSET_X;
		position.x += (note.posX > 0 ? -1 : 1) * BLOCK_CELL_SIZE;
	} else {
		const OFFSET_X = BLOCK_CELL_SIZE * -1.5;
		position.x = note.posX * BLOCK_CELL_SIZE + OFFSET_X;
	}

	if (note.posY >= 1000 || note.posY <= -1000) {
		const OFFSET_Y = BLOCK_CELL_SIZE * -1;
		position.y = (note.posY / 1000) * BLOCK_CELL_SIZE + OFFSET_Y;
		position.y += (note.posY > 0 ? -1 : 1) * BLOCK_CELL_SIZE;
	} else {
		const OFFSET_Y = BLOCK_CELL_SIZE * -1;
		position.y = note.posY * BLOCK_CELL_SIZE + OFFSET_Y;
	}

	if (note.time !== undefined && beatDepth) {
		position.z = -SONG_OFFSET;
		// We want to first lay the notes out with proper spacing between them.
		// beatDepth controls the distance between two 1/4 notes.
		// We want this to all be BPM-independent; two quarter notes should be equally distant regardless of BPM. To do this, we have to convert the note time into notes.
		// First, get the note's "starting" position. Where it is when the song is at 0:00
		const startingPosition = note.time * beatDepth * -1;

		// Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
		position.z += startingPosition;
	}

	return [position.x, position.y, position.z];
}

export function resolveRotationForNoteDirection(direction: number) {
	// If the rotation is >=1000, we're in MappingExtensions land :D
	// It uses a 1000-1360 system, from down clockwise.
	// We have some conversions to do, to get an angle in radians.

	// (this formula is a little bonkers, there's probably a simpler way, but it works.)
	const reorientedAngle = 180 - ((direction + 270) % 360);
	// hack: visual rotation is slightly off from the correct rotation value, not sure where this is happening but we can fix it here
	const patchedAngle = reorientedAngle + Math.PI * 3;
	return convertDegreesToRadians(patchedAngle);
}
