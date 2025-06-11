import { resolveNoteAngle } from "bsmap";
import type { wrapper } from "bsmap/types";
import type { Vector3Tuple } from "three";

import type { RequiredKeys } from "$/types";
import { convertDegreesToRadians } from "$/utils";
import { BLOCK_CELL_SIZE, SONG_OFFSET } from "./constants";

export interface PositionResolverOptions {
	beatDepth?: number;
}
export function resolvePositionForGridObject<T extends RequiredKeys<Partial<wrapper.IWrapBaseNote>, "posX" | "posY">>(object: T, { beatDepth }: PositionResolverOptions): Vector3Tuple {
	const position = { x: 0, y: 0, z: 0 };

	if (object.posX >= 1000 || object.posX <= -1000) {
		const OFFSET_X = BLOCK_CELL_SIZE * -1.5;
		position.x = (object.posX / 1000) * BLOCK_CELL_SIZE + OFFSET_X;
		position.x += (object.posX > 0 ? -1 : 1) * BLOCK_CELL_SIZE;
	} else {
		const OFFSET_X = BLOCK_CELL_SIZE * -1.5;
		position.x = object.posX * BLOCK_CELL_SIZE + OFFSET_X;
	}

	if (object.posY >= 1000 || object.posY <= -1000) {
		const OFFSET_Y = BLOCK_CELL_SIZE * -1;
		position.y = (object.posY / 1000) * BLOCK_CELL_SIZE + OFFSET_Y;
		position.y += (object.posY > 0 ? -1 : 1) * BLOCK_CELL_SIZE;
	} else {
		const OFFSET_Y = BLOCK_CELL_SIZE * -1;
		position.y = object.posY * BLOCK_CELL_SIZE + OFFSET_Y;
	}

	if (object.time !== undefined && beatDepth) {
		position.z = -SONG_OFFSET;
		// We want to first lay the notes out with proper spacing between them.
		// beatDepth controls the distance between two 1/4 notes.
		// We want this to all be BPM-independent; two quarter notes should be equally distant regardless of BPM. To do this, we have to convert the note time into notes.
		// First, get the note's "starting" position. Where it is when the song is at 0:00
		// Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
		position.z += object.time * beatDepth * -1;
	}

	return [position.x, position.y, position.z];
}

export function resolveRotationForNote<T extends { direction: number; angleOffset: number }>(object: T) {
	// If the rotation is >=1000, we're in MappingExtensions land :D
	// It uses a 1000-1360 system, from down clockwise.
	if (object.direction >= 1000) {
		// We have some conversions to do, to get an angle in radians.
		// (this formula is a little bonkers, there's probably a simpler way, but it works.)
		const reorientedAngle = 180 - ((object.direction + 270) % 360);
		// hack: visual rotation is slightly off from the correct rotation value, not sure where this is happening but we can fix it here
		const patchedAngle = reorientedAngle + Math.PI * 3;
		return convertDegreesToRadians(patchedAngle);
	}
	return convertDegreesToRadians(resolveNoteAngle(object.direction) + object.angleOffset);
}
