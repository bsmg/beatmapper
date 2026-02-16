import { useContext, useMemo } from "react";

import { Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { resolvePositionForObstacle } from "$/components/scene/helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectDefaultObstacleDuration } from "$/store/selectors";
import type { IGrid, ObjectPlacementMode } from "$/types";
import type { GroupProps } from "$/types/vendor";
import { Context } from "./context";

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

	return (
		<group position-z={SONG_OFFSET}>
			<Obstacle {...rest} position={position} data={data} beatDepth={beatDepth} color={color} />
		</group>
	);
}

export default TentativeObstacle;
