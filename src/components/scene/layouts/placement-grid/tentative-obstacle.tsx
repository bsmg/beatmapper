import type { GroupProps } from "@react-three/fiber";
import { useContext, useMemo } from "react";

import { FUDGE_FACTOR, SONG_OFFSET } from "$/components/scene/constants";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectDefaultObstacleDuration } from "$/store/selectors";
import type { IGrid, ObjectPlacementMode } from "$/types";

import { Obstacle, resolveDimensionsForObstacle, resolvePositionForObstacle } from "$/components/scene/compositions";
import { Context } from "./context";

// hack: a tiny bit of fudge factor is added to the z position, so that the grid cells are still interactable while resizing the obstacle.
// that way, you're still able to update the mouseOverAt property without the hitbox of the obstacle interfering.
const Z_POSITION = SONG_OFFSET - FUDGE_FACTOR;

interface Props extends GroupProps {
	grid: IGrid;
	mode: ObjectPlacementMode;
	color: string;
}
function TentativeObstacle({ mode, grid, color, ...rest }: Props) {
	const { cellDownAt, cellOverAt } = useContext(Context);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);
	const beatDepth = useAppSelector(selectBeatDepth);

	const data = useMemo(() => {
		if (!cellDownAt || !cellOverAt) return null;
		// If no mouseOverAt is provided, it ought to be the same as the mouseDownAt.
		// They've clicked but haven't moved yet, ergo only one row/col is at play.
		return {
			...createObstacleFromMouseEvent(mode, cellDownAt, cellOverAt ?? cellDownAt, grid),
			duration: defaultObstacleDuration,
			tentative: true,
		};
	}, [mode, grid, cellDownAt, cellOverAt, defaultObstacleDuration]);

	if (!data) return;

	const position = resolvePositionForObstacle(data, { beatDepth });
	const dimensions = resolveDimensionsForObstacle(data, { beatDepth });

	return <Obstacle {...rest} data={data} position-x={position[0]} position-y={position[1]} position-z={position[2] + Z_POSITION} dimensions={dimensions} color={color} />;
}

export default TentativeObstacle;
