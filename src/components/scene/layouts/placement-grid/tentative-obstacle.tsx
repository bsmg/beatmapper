import type { ThreeElements } from "@react-three/fiber";
import { useContext, useMemo } from "react";

import { SONG_OFFSET } from "$/components/scene/constants";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectDefaultObstacleDuration, selectGridSize, selectPlacementMode } from "$/store/selectors";
import type { SongId } from "$/types";

import { Obstacle } from "$/components/scene/compositions";
import { Context } from "./context";

// hack: a tiny bit of fudge factor is added to the z position, so that the grid cells are still interactable while resizing the obstacle.
// that way, you're still able to update the mouseOverAt property without the hitbox of the obstacle interfering.
const Z_POSITION = SONG_OFFSET - 0.05;

type GroupProps = ThreeElements["group"];

interface Props extends GroupProps {
	sid: SongId;
	color: string;
}
function TentativeObstacle({ sid, color, ...rest }: Props) {
	const { mouseDownAt, mouseOverAt: initialMouseOverAt } = useContext(Context);

	const { numRows: gridRows, numCols: gridCols, colWidth: gridColWidth, rowHeight: gridRowHeight } = useAppSelector((state) => selectGridSize(state, sid));
	const beatDepth = useAppSelector(selectBeatDepth);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);
	const mappingMode = useAppSelector((state) => selectPlacementMode(state, sid));

	// If no mouseOverAt is provided, it ought to be the same as the mouseDownAt.
	// They've clicked but haven't moved yet, ergo only one row/col is at play.
	const mouseOverAt = useMemo(() => initialMouseOverAt ?? mouseDownAt, [initialMouseOverAt, mouseDownAt]);

	const tentativeObstacle = useMemo(() => {
		if (!mouseDownAt) return null;
		return {
			...createObstacleFromMouseEvent(mappingMode, gridCols, gridRows, gridColWidth, gridRowHeight, mouseDownAt, mouseOverAt, defaultObstacleDuration),
			tentative: true,
		};
	}, [mappingMode, gridCols, gridRows, gridColWidth, gridRowHeight, mouseDownAt, mouseOverAt, defaultObstacleDuration]);

	if (!tentativeObstacle) return;

	return <Obstacle {...rest} position-z={Z_POSITION} data={tentativeObstacle} beatDepth={beatDepth} color={color} gridRows={gridRows} gridCols={gridCols} />;
}

export default TentativeObstacle;
