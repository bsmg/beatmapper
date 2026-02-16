import { resolveNoteAngle } from "bsmap";
import type { wrapper } from "bsmap/types";
import type { Vector3Tuple } from "three";

import type { App, RequiredKeys } from "$/types";
import { convertDegreesToRadians } from "$/utils";
import { BLOCK_CELL_SIZE, FUDGE_FACTOR, SONG_OFFSET } from "./constants";

export interface ObjectResolverOptions {
	beatDepth: number;
	zOffset?: number;
}
export function resolvePositionForGridObject<T extends RequiredKeys<Partial<wrapper.IWrapBaseNote>, "posX" | "posY">>(object: T, { beatDepth, zOffset = 0 }: Pick<ObjectResolverOptions, "beatDepth" | "zOffset">): Vector3Tuple {
	const position = { x: 0, y: 0, z: 0 };

	// ----------- X ------------
	const posX = object.posX >= 1000 || object.posX <= -1000 ? (object.posX < 0 ? object.posX / 1000 + 1 : object.posX / 1000 - 1) : object.posX;
	position.x = posX * BLOCK_CELL_SIZE + BLOCK_CELL_SIZE * -1.5;
	// ----------- Y ------------
	const posY = object.posY >= 1000 || object.posY <= -1000 ? (object.posY < 0 ? object.posY / 1000 + 1 : object.posY / 1000 - 1) : object.posY;
	position.y = posY * BLOCK_CELL_SIZE + BLOCK_CELL_SIZE * -1;
	// ----------- Z ------------
	if (object.time !== undefined && beatDepth) {
		position.z = -SONG_OFFSET;
		// We want to first lay the notes out with proper spacing between them.
		// beatDepth controls the distance between two 1/4 notes.
		// We want this to all be BPM-independent; two quarter notes should be equally distant regardless of BPM. To do this, we have to convert the note time into notes.
		// First, get the note's "starting" position. Where it is when the song is at 0:00
		// Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
		position.z += object.time * beatDepth * -1;
	}

	return [position.x, position.y, position.z + zOffset];
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

export function resolvePositionForObstacle<T extends App.IObstacle>(data: T, { beatDepth, zOffset = 0 }: Pick<ObjectResolverOptions, "beatDepth" | "zOffset">) {
	const position = resolvePositionForGridObject(data, { beatDepth, zOffset });

	// ----------- X ------------
	const width = data.width >= 1000 || data.width <= -1000 ? data.width / 1000 - 1 : data.width;
	position[0] += width * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE / 2;
	// ----------- Y ------------
	const height = data.height >= 1000 || data.height <= -1000 ? data.height / 1000 - 1 : data.height;
	position[1] += height * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE;
	// ----------- Z ------------
	position[2] -= (data.duration * beatDepth) / 2 + FUDGE_FACTOR;

	return position;
}

export function resolveDimensionsForObstacle<T extends App.IObstacle>(data: T, { beatDepth }: Pick<ObjectResolverOptions, "beatDepth">) {
	const dimensions = { width: 0, height: 0, depth: 0 };

	// ----------- WIDTH ------------
	if (data.width >= 1000 || data.width <= -1000) {
		dimensions.width = (data.width / 1000 - 1) * BLOCK_CELL_SIZE;
	} else {
		dimensions.width = data.width * BLOCK_CELL_SIZE;
	}
	// ----------- HEIGHT ------------
	if (data.height >= 1000 || data.height <= -1000) {
		dimensions.height = (data.height / 1000 - 1) * BLOCK_CELL_SIZE;
	} else {
		dimensions.height = data.height * BLOCK_CELL_SIZE;
	}
	// ----------- DEPTH ------------
	dimensions.depth = data.duration * beatDepth;
	// We don't want to allow invisible / 0-depth walls
	if (dimensions.depth === 0) dimensions.depth = 0.01;

	return { width: dimensions.width, height: dimensions.height, depth: dimensions.depth };
}
