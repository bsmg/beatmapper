import { getColorForItem } from "$/helpers/colors.helpers";
import { deleteObstacle, deselectObstacle, resizeObstacle, selectObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getBeatDepth, getNoteSelectionMode, getSnapTo, selectActiveSongId, selectAllVisibleObstacles, selectCustomColors } from "$/store/selectors";
import { ObjectSelectionMode, ObjectTool } from "$/types";

import ObstacleBox from "../ObstacleBox";

const Obstacles = () => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const obstacles = useAppSelector(selectAllVisibleObstacles);
	const beatDepth = useAppSelector(getBeatDepth);
	const selectionMode = useAppSelector(getNoteSelectionMode);
	const snapTo = useAppSelector(getSnapTo);
	const dispatch = useAppDispatch();

	const obstacleColor = getColorForItem(ObjectTool.OBSTACLE, customColors);

	return obstacles.map((obstacle) => (
		<ObstacleBox
			key={obstacle.id}
			obstacle={obstacle}
			color={obstacleColor}
			beatDepth={beatDepth}
			snapTo={snapTo}
			handleDelete={(id) => dispatch(deleteObstacle({ id }))}
			handleResize={(id, newBeatDuration) => dispatch(resizeObstacle({ id, newBeatDuration }))}
			handleClick={() => dispatch(obstacle.selected ? deselectObstacle({ id: obstacle.id }) : selectObstacle({ id: obstacle.id }))}
			handleMouseOver={() => {
				if (selectionMode === ObjectSelectionMode.SELECT && !obstacle.selected) {
					dispatch(selectObstacle({ id: obstacle.id }));
				} else if (selectionMode === ObjectSelectionMode.DESELECT && obstacle.selected) {
					dispatch(deselectObstacle({ id: obstacle.id }));
				} else if (selectionMode === ObjectSelectionMode.DELETE) {
					dispatch(deleteObstacle({ id: obstacle.id }));
				}
			}}
		/>
	));
};

export default Obstacles;
