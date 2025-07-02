import { BLOCK_CELL_SIZE, FUDGE_FACTOR } from "$/components/scene/constants";
import type { App } from "$/types";
import { type PositionResolverOptions, resolvePositionForGridObject } from "../../helpers";

interface Options extends PositionResolverOptions {
	beatDepth: number;
}
export function resolvePositionForObstacle(obstacle: App.IObstacle, { beatDepth }: Options): [number, number, number] {
	const position = resolvePositionForGridObject(obstacle, { beatDepth });

	// ----------- X ------------
	const width = obstacle.width >= 1000 || obstacle.width <= -1000 ? obstacle.width / 1000 - 1 : obstacle.width;
	position[0] += width * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE / 2;
	// ----------- Y ------------
	const height = obstacle.height >= 1000 || obstacle.height <= -1000 ? obstacle.height / 1000 - 1 : obstacle.height;
	position[1] += height * (BLOCK_CELL_SIZE / 2) - BLOCK_CELL_SIZE;
	// ----------- Z ------------
	position[2] -= (obstacle.duration * beatDepth) / 2 + FUDGE_FACTOR;

	return position;
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
