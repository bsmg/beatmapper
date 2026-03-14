import { NoteDirection } from "bsmap";
import type { Vector2Like } from "three";

import type { NotePlacementMode } from "$/types";
import { convertCartesianToPolar, convertRadiansToDegrees, normalizeAngle } from "$/utils";

const CHUNK_SIZE = 45; // We have 8 possible directions in a 360-degree circle, so each direction gets a 45-degree wedge.
const CHUNK_DIRECTIONS = [NoteDirection.RIGHT, NoteDirection.DOWN_RIGHT, NoteDirection.DOWN, NoteDirection.DOWN_LEFT, NoteDirection.LEFT, NoteDirection.UP_LEFT, NoteDirection.UP, NoteDirection.UP_RIGHT];

interface Options {
	mode: NotePlacementMode;
	usePrecisionPlacement: boolean;
	threshold?: number;
	selectedDirection?: NoteDirection;
}
export function resolveNoteDirectionForPlacementMode(initialPosition: Vector2Like, currentPosition: Vector2Like, { threshold = 25, usePrecisionPlacement, selectedDirection }: Options): number | null {
	const deltaX = currentPosition.x - initialPosition.x;
	const deltaY = currentPosition.y - initialPosition.y;

	const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

	if (distance < threshold) {
		return null;
	}

	const isDot = selectedDirection === NoteDirection.ANY;

	const [theta] = convertCartesianToPolar(currentPosition, initialPosition);
	const angle = convertRadiansToDegrees(theta);

	if (usePrecisionPlacement) {
		// Angles in JS start at the 3 o'clock position (to the right), and count clockwise from 0 to 360.
		// For mapping extensions, we need to start at 6 o'clock (down), and count clockwise from 1000 to 1360.
		// First, let's reorient the JS angle to start down and go from 0 to 360.
		const normalizedAngle = normalizeAngle(angle - 270);
		// Then we just need to add 1000, to push it up into the right range.
		return normalizedAngle + (isDot ? 2000 : 1000);
	} else {
		const normalizedAngle = normalizeAngle(angle + CHUNK_SIZE / 2);
		const chunkIndex = Math.floor(normalizedAngle / CHUNK_SIZE);

		return isDot ? NoteDirection.ANY : CHUNK_DIRECTIONS[chunkIndex];
	}
}
