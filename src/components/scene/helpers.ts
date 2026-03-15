import { type IWrapBaseNote, type IWrapColorNote, type IWrapGridObject, type IWrapObstacle, isInline, resolveNoteAngle } from "bsmap";
import type { Vector3Tuple } from "three";

import { DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS } from "$/constants";
import { deserializeCoordinate, isExtendedCoordinate } from "$/helpers/item.helpers";
import { isColorNote, resolveNoteId } from "$/helpers/notes.helpers";
import { convertDegreesToRadians } from "$/utils";
import { BLOCK_CELL_SIZE, SONG_OFFSET } from "./constants";

export interface ObjectResolverOptions {
	beatDepth: number;
	zOffset?: number;
}
export function resolvePositionForGridObject<T extends IWrapGridObject>(data: T, { beatDepth, zOffset = 0 }: Pick<ObjectResolverOptions, "beatDepth" | "zOffset">): Vector3Tuple {
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

export function resolveRotationForNote<T extends IWrapBaseNote>(data: T) {
	if (isExtendedCoordinate(data.direction)) {
		return convertDegreesToRadians(180 - (data.direction % 1000));
	}
	const angleOffset = isColorNote(data) ? data.angleOffset : 0;
	return convertDegreesToRadians(resolveNoteAngle(data.direction) + angleOffset);
}

export function resolvePositionForObstacle<T extends IWrapObstacle>(data: T, { beatDepth, zOffset = 0 }: Pick<ObjectResolverOptions, "beatDepth" | "zOffset">) {
	const position = resolvePositionForGridObject(data, { beatDepth, zOffset });

	// ----------- X ------------
	position[0] += (deserializeCoordinate(data.width) / 2 - 0.5) * BLOCK_CELL_SIZE;
	// ----------- Y ------------
	position[1] += (deserializeCoordinate(data.height) / 2 - 1.0) * BLOCK_CELL_SIZE;
	// ----------- Z ------------
	position[2] -= (data.duration * beatDepth) / 2;

	return position;
}

export function resolveDimensionsForObstacle<T extends IWrapObstacle>(data: T, { beatDepth }: Pick<ObjectResolverOptions, "beatDepth">) {
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

export function calculateInlineRotations<T extends IWrapColorNote>(notes: T[], lapping: number = Math.hypot(DEFAULT_NUM_COLS, DEFAULT_NUM_ROWS), tolerance: number = Math.PI / 2): Map<string, number> {
	const overrides = new Map<string, number>();

	const processedIds = new Set<string>();

	for (let i = 0; i < notes.length; i++) {
		const n1 = notes[i];
		const id1 = resolveNoteId(n1);
		if (processedIds.has(id1)) continue;

		for (let j = i + 1; j < notes.length; j++) {
			const n2 = notes[j];
			const id2 = resolveNoteId(n2);
			if (processedIds.has(id2)) continue;

			if (Math.abs(n1.time - n2.time) < Number.EPSILON && n1.color === n2.color && n1.direction === n2.direction && isInline(n1, n2, lapping)) {
				const nativeAngle = resolveRotationForNote(n1);

				const dx = n2.posX - n1.posX;
				const dy = n2.posY - n1.posY;

				const angleA = Math.atan2(dy, dx) - Math.PI / 2;
				const angleB = Math.atan2(-dy, -dx) - Math.PI / 2;

				const getDiff = (a: number) => Math.abs(Math.atan2(Math.sin(a - nativeAngle), Math.cos(a - nativeAngle)));

				const diffA = getDiff(angleA);
				const diffB = getDiff(angleB);

				const bestAngle = diffA < diffB ? angleA : angleB;

				if (Math.min(diffA, diffB) <= tolerance - Number.EPSILON) {
					overrides.set(id1, bestAngle);
					overrides.set(id2, bestAngle);

					processedIds.add(id1);
					processedIds.add(id2);

					break;
				}
			}
		}
	}

	return overrides;
}
