import { resolveNoteAngle } from "bsmap";
import type { wrapper } from "bsmap/types";
import type { Vector3Tuple } from "three";

import { deserializeCoordinate, isExtendedCoordinate } from "$/helpers/item.helpers";
import { isColorNote } from "$/helpers/notes.helpers";
import { convertDegreesToRadians } from "$/utils";
import { BLOCK_CELL_SIZE, SONG_OFFSET } from "./constants";

export interface ObjectResolverOptions {
	beatDepth: number;
	zOffset?: number;
}
export function resolvePositionForGridObject<T extends wrapper.IWrapGridObject>(data: T, { beatDepth, zOffset = 0 }: Pick<ObjectResolverOptions, "beatDepth" | "zOffset">): Vector3Tuple {
	const position: Vector3Tuple = [0, 0, 0];

	// ----------- X ------------
	position[0] = (deserializeCoordinate(data.posX) + -1.5) * BLOCK_CELL_SIZE;
	// ----------- Y ------------
	position[1] = (deserializeCoordinate(data.posY) + -1) * BLOCK_CELL_SIZE;
	// ----------- Z ------------
	position[2] = -SONG_OFFSET + data.time * beatDepth * -1;
	// we may need to apply a manual offset for tentative objects
	position[2] += zOffset;

	return position;
}

export function resolveRotationForNote<T extends wrapper.IWrapBaseNote>(data: T) {
	if (isExtendedCoordinate(data.direction)) {
		return convertDegreesToRadians(180 - (data.direction % 1000));
	}
	const angleOffset = isColorNote(data) ? data.angleOffset : 0;
	return convertDegreesToRadians(resolveNoteAngle(data.direction) + angleOffset);
}

export function resolvePositionForObstacle<T extends wrapper.IWrapObstacle>(data: T, { beatDepth, zOffset = 0 }: Pick<ObjectResolverOptions, "beatDepth" | "zOffset">) {
	const position = resolvePositionForGridObject(data, { beatDepth, zOffset });

	// ----------- X ------------
	position[0] += (deserializeCoordinate(data.width) / 2 - 0.5) * BLOCK_CELL_SIZE;
	// ----------- Y ------------
	position[1] += (deserializeCoordinate(data.height) / 2 - 1.0) * BLOCK_CELL_SIZE;
	// ----------- Z ------------
	position[2] -= (data.duration * beatDepth) / 2;

	return position;
}

export function resolveDimensionsForObstacle<T extends wrapper.IWrapObstacle>(data: T, { beatDepth }: Pick<ObjectResolverOptions, "beatDepth">) {
	const dimensions: Vector3Tuple = [0, 0, 0];

	// ----------- WIDTH ------------
	dimensions[0] = deserializeCoordinate(data.width) * BLOCK_CELL_SIZE;
	// ----------- HEIGHT ------------
	dimensions[1] = deserializeCoordinate(data.height) * BLOCK_CELL_SIZE;
	// ----------- DEPTH ------------
	dimensions[2] = data.duration * beatDepth;
	// we don't want to allow zero-depth walls
	dimensions[2] = Math.max(dimensions[2], 0.01);

	return dimensions;
}
