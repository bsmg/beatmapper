import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { useAppSelector } from "$/store/hooks";
import { getBeatDepth, getDefaultObstacleDuration, getGridSize } from "$/store/selectors";
import type { ObjectPlacementMode } from "$/types";

import ObstacleBox from "../ObstacleBox";

interface Props {
	mouseDownAt: { rowIndex: number; colIndex: number; x: number; y: number };
	mouseOverAt: { rowIndex: number; colIndex: number; x?: number; y?: number } | null;
	color: string;
	mode: ObjectPlacementMode;
}

const TentativeObstacle = ({ mouseDownAt, color, mode, ...rest }: Props) => {
	const { numRows: gridRows, numCols: gridCols, colWidth: gridColWidth, rowHeight: gridRowHeight } = useAppSelector(getGridSize);
	const beatDepth = useAppSelector(getBeatDepth);
	const defaultObstacleDuration = useAppSelector(getDefaultObstacleDuration);

	// If no mouseOverAt is provided, it ought to be the same as the mouseDownAt.
	// They've clicked but haven't moved yet, ergo only one row/col is at play.
	let { mouseOverAt } = rest;
	if (!mouseOverAt) {
		mouseOverAt = mouseDownAt;
	}

	const tentativeObstacle = createObstacleFromMouseEvent(mode, gridCols, gridRows, gridColWidth, gridRowHeight, mouseDownAt, mouseOverAt, defaultObstacleDuration);

	tentativeObstacle.id = "tentative";
	tentativeObstacle.tentative = true;
	tentativeObstacle.beatNum = 0;

	return (
		<ObstacleBox
			obstacle={tentativeObstacle}
			beatDepth={beatDepth}
			color={color}
			snapTo={1} // Doesn't matter
			gridRows={gridRows}
			gridCols={gridCols}
			handleDelete={() => {}}
			handleResize={() => {}}
			handleClick={() => {}}
		/>
	);
};

export default TentativeObstacle;
