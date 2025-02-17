import type { Vector2Like } from "three";

import { CutDirection, ObjectPlacementMode } from "$/types";
import { convertCartesianToPolar } from "$/utils";

function getDirectionForStandardMode(angle: number) {
	// We have 8 possible directions in a 360-degree circle, so each direction gets a 45-degree wedge. The angles start going straight to the right and move clockwise:
	//
	//                   270deg
	//                    |
	//                    |
	//   --------------   .   -------------- 0deg
	//                    |
	//                    |
	//                    |
	//                   90deg
	//
	// Awkwardly, My right-most wedge needs to go from 337.5 deg to 22.5deg.
	// This'll be the first chunk, and they'll continue clockwise, from 0 to 8.
	const chunkSize = 360 / 8;
	const chunkOffset = chunkSize / 2;

	let chunkIndex: number;
	if (angle >= 337.5 || angle < 22.5) {
		chunkIndex = 0;
	} else {
		chunkIndex = Math.floor((angle + chunkOffset) / chunkSize);
	}

	switch (chunkIndex) {
		case 0:
			return CutDirection.RIGHT;
		case 1:
			return CutDirection.DOWN_RIGHT;
		case 2:
			return CutDirection.DOWN;
		case 3:
			return CutDirection.DOWN_LEFT;
		case 4:
			return CutDirection.LEFT;
		case 5:
			return CutDirection.UP_LEFT;
		case 6:
			return CutDirection.UP;
		case 7:
			return CutDirection.UP_RIGHT;
		default:
			throw new Error(`Unrecognized chunk index: ${chunkIndex}`);
	}
}

export const getDirectionForMappingExtensions = (angle: number) => {
	// Angles in JS start at the 3 o'clock position (to the right), and count clockwise from 0 to 360.
	// For mapping extensions, we need to start at 6 o'clock (down), and count clockwise from 1000 to 1360.

	// First, let's reorient the JS angle to start down and go from 0 to 360.
	const reorientedAngle = (angle + 270) % 360;

	// Then we just need to add 1000, to push it up into the right range.
	return reorientedAngle + 1000;
};

export const getDirectionForDrag = (initialPosition: Vector2Like, currentPosition: Vector2Like, mappingMode: ObjectPlacementMode, precisionPlacement: boolean) => {
	const deltaX = currentPosition.x - initialPosition.x;
	const deltaY = currentPosition.y - initialPosition.y;

	const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
	const THRESHOLD = 25;

	if (distance < THRESHOLD) {
		return null;
	}

	const [angleInRadians] = convertCartesianToPolar(currentPosition, initialPosition);
	const angle = (angleInRadians * 180) / Math.PI;

	// We need to convert this index to the batty set of directions the app uses.
	if (mappingMode === ObjectPlacementMode.EXTENSIONS && precisionPlacement) {
		return getDirectionForMappingExtensions(angle);
	}
	return getDirectionForStandardMode(angle);
};
