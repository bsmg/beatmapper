import { BLOCK_CELL_SIZE, FUDGE_FACTOR, SONG_OFFSET } from "$/components/scene/constants";
import type { App } from "$/types";

interface Options {
	beatDepth: number;
}

export function resolvePositionForObstacle(obstacle: App.IObstacle, { beatDepth: zOffset }: Options): [number, number, number] {
	const position = { x: 0, y: 0, z: 0 };

	// ----------- X ------------
	// Our initial X should be 1.5 blocks to the left (an 'X' of 0 would be the dividing line between the 2nd and 3rd column,
	// so I need it to move 1.5 units to the left, to sit in the center of the 1st column)
	if (obstacle.posX >= 1000 || obstacle.posX <= -1000) {
		const OFFSET_X = BLOCK_CELL_SIZE * -1.5;
		position.x = (obstacle.posX / 1000) * BLOCK_CELL_SIZE + OFFSET_X;
		position.x += (obstacle.posX > 0 ? -1 : 1) * BLOCK_CELL_SIZE;
		position.x += (obstacle.width / 1000 - 1) * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE / 2;
	} else {
		const OFFSET_X = BLOCK_CELL_SIZE * -1.5;
		position.x = obstacle.posX * BLOCK_CELL_SIZE + OFFSET_X;
		position.x += obstacle.width * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE / 2;
	}
	// ----------- Y ------------
	if (obstacle.posY >= 1000 || obstacle.posY <= -1000) {
		const OFFSET_Y = BLOCK_CELL_SIZE * -1;
		position.y = (obstacle.posY / 1000) * BLOCK_CELL_SIZE + OFFSET_Y;
		position.y += (obstacle.posY > 0 ? -1 : 1) * BLOCK_CELL_SIZE;
		position.y += (obstacle.height / 1000 - 1) * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE / 2;
	} else {
		const OFFSET_Y = BLOCK_CELL_SIZE * -0.75;
		position.y = obstacle.posY * BLOCK_CELL_SIZE + OFFSET_Y - 1;
		position.y += obstacle.height * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE / 2;
	}
	// ----------- Z ------------
	const zFront = obstacle.time * zOffset * -1 - SONG_OFFSET;
	position.z = zFront - (obstacle.duration * zOffset) / 2 + FUDGE_FACTOR;

	return [position.x, position.y, position.z];
}

export function resolveDimensionsForObstacle(obstacle: App.IObstacle, { beatDepth }: Options) {
	const dimensions = { width: 0, height: 0, depth: 0 };

	// ----------- WIDTH ------------
	if (obstacle.width >= 1000 || obstacle.width <= -1000) {
		dimensions.width = (obstacle.width / 1000 - 1) * BLOCK_CELL_SIZE;
	} else {
		dimensions.width = obstacle.width * BLOCK_CELL_SIZE;
	}
	// ----------- HEIGHT ------------
	if (obstacle.height >= 1000 || obstacle.height <= -1000) {
		dimensions.height = (obstacle.height / 1000 - 1) * BLOCK_CELL_SIZE;
	} else {
		dimensions.height = obstacle.height * BLOCK_CELL_SIZE;
	}
	// ----------- DEPTH ------------
	dimensions.depth = obstacle.duration * beatDepth;
	// We don't want to allow invisible / 0-depth walls
	if (dimensions.depth === 0) dimensions.depth = 0.01;

	return { width: dimensions.width, height: dimensions.height, depth: dimensions.depth };
}
