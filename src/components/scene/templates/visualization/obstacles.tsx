import { getColorForItem } from "$/helpers/colors.helpers";
import { deleteObstacle, deselectObstacle, resizeObstacle, selectObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleObstacles, selectBeatDepth, selectCustomColors, selectNoteEditorSelectionMode, selectSnapTo } from "$/store/selectors";
import { type App, ObjectSelectionMode, ObjectTool, type SongId } from "$/types";

import { ObstacleBox } from "$/components/scene/compositions";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useCallback, useMemo, useState } from "react";

interface Props {
	sid: SongId;
}
function Obstacles({ sid }: Props) {
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid));
	const beatDepth = useAppSelector(selectBeatDepth);
	const selectionMode = useAppSelector(selectNoteEditorSelectionMode);
	const snapTo = useAppSelector(selectSnapTo);
	const dispatch = useAppDispatch();

	const [hoveredId, setHoveredId] = useState<App.Obstacle["id"] | null>(null);

	const obstacleColor = useMemo(() => getColorForItem(ObjectTool.OBSTACLE, customColors), [customColors]);

	const resolveClickAction = useCallback(
		(obstacle: App.Obstacle) => {
			dispatch(obstacle.selected ? deselectObstacle({ id: obstacle.id }) : selectObstacle({ id: obstacle.id }));
		},
		[dispatch],
	);

	const handlePointerDown = useCallback(
		(ev: PointerEvent, data: App.Obstacle) => {
			ev.stopPropagation();

			if (ev.buttons === 2) {
				dispatch(deleteObstacle({ id: data.id }));
			}
		},
		[dispatch],
	);

	const handlePointerUp = useCallback(
		(ev: PointerEvent, obstacle: App.Obstacle) => {
			ev.stopPropagation();

			if (obstacle.tentative) return;
			// if we're selecting obstacles
			if (selectionMode && hoveredId) return;

			if (ev.buttons === 0) {
				resolveClickAction(obstacle);
			}
		},
		[selectionMode, hoveredId, resolveClickAction],
	);

	const handlePointerOver = useCallback(
		(_: PointerEvent, obstacle: App.Obstacle) => {
			if (!selectionMode) {
				return setHoveredId(obstacle.id);
			}
			if (selectionMode === ObjectSelectionMode.SELECT && !obstacle.selected) {
				dispatch(selectObstacle({ id: obstacle.id }));
			} else if (selectionMode === ObjectSelectionMode.DESELECT && obstacle.selected) {
				dispatch(deselectObstacle({ id: obstacle.id }));
			} else if (selectionMode === ObjectSelectionMode.DELETE) {
				dispatch(deleteObstacle({ id: obstacle.id }));
			}
		},
		[dispatch, selectionMode],
	);

	const handlePointerOut = useCallback(
		(_: PointerEvent) => {
			if (hoveredId) setHoveredId(null);
		},
		[hoveredId],
	);

	const resolveWheelAction = useDebouncedCallback(
		(ev: WheelEvent, obstacle: App.Obstacle, snapTo: number) => {
			const delta = ev.deltaY > 0 ? -1 : 1;
			const newDuration = obstacle.beatDuration + snapTo * delta;
			// the new duration value should never create an invalid obstacle.
			if (newDuration <= 0 || Math.abs(newDuration) < 0.01) return;

			dispatch(resizeObstacle({ id: obstacle.id, newBeatDuration: obstacle.beatDuration + snapTo * delta }));
		},
		{ wait: 50 },
	);

	const handleWheel = useCallback(
		(ev: WheelEvent, obstacle: App.Obstacle) => {
			// if we're not hovering over an obstacle, no need to fire the event.
			if (!hoveredId) return;

			ev.preventDefault();
			if (ev.altKey) {
				resolveWheelAction(ev, obstacle, snapTo);
			}
		},
		[hoveredId, snapTo, resolveWheelAction],
	);

	return obstacles.map((obstacle) => (
		<ObstacleBox key={obstacle.id} data={obstacle} color={obstacleColor} beatDepth={beatDepth} onObstaclePointerDown={handlePointerDown} onObstaclePointerUp={handlePointerUp} onObstaclePointerOver={handlePointerOver} onObstaclePointerOut={handlePointerOut} onObstacleWheel={handleWheel} />
	));
}

export default Obstacles;
