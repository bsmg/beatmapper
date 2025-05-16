import type { EntityId } from "@reduxjs/toolkit";
import { useCallback, useMemo, useState } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { deleteObstacle, deselectObstacle, resizeObstacle, selectObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleObstacles, selectColorScheme, selectNoteEditorSelectionMode, selectSnapTo } from "$/store/selectors";
import { type App, type BeatmapId, ObjectSelectionMode, ObjectTool, type SongId } from "$/types";

import { Obstacle, resolveDimensionsForObstacle, resolvePositionForObstacle } from "$/components/scene/compositions";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	beatDepth: number;
	surfaceDepth: number;
}
function EditorObstacles({ sid, bid, beatDepth, surfaceDepth }: Props) {
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid, beatDepth, surfaceDepth));
	const selectionMode = useAppSelector(selectNoteEditorSelectionMode);
	const snapTo = useAppSelector(selectSnapTo);
	const dispatch = useAppDispatch();

	const [hoveredId, setHoveredId] = useState<EntityId | null>(null);

	const obstacleColor = useMemo(() => resolveColorForItem(ObjectTool.OBSTACLE, { customColors: colorScheme }), [colorScheme]);

	const resolveClickAction = useCallback(
		(obstacle: App.IObstacle) => {
			const id = resolveObstacleId(obstacle);
			dispatch(obstacle.selected ? deselectObstacle({ id: id }) : selectObstacle({ id: id }));
		},
		[dispatch],
	);

	const handlePointerDown = useCallback(
		(ev: PointerEvent, data: App.IObstacle) => {
			ev.stopPropagation();
			const id = resolveObstacleId(data);

			if (ev.buttons === 2) {
				dispatch(deleteObstacle({ id: id }));
			}
		},
		[dispatch],
	);

	const handlePointerUp = useCallback(
		(ev: PointerEvent, obstacle: App.IObstacle) => {
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
		(_: PointerEvent, obstacle: App.IObstacle) => {
			const id = resolveObstacleId(obstacle);
			if (!selectionMode) {
				return setHoveredId(id);
			}
			if (selectionMode === ObjectSelectionMode.SELECT && !obstacle.selected) {
				dispatch(selectObstacle({ id: id }));
			} else if (selectionMode === ObjectSelectionMode.DESELECT && obstacle.selected) {
				dispatch(deselectObstacle({ id: id }));
			} else if (selectionMode === ObjectSelectionMode.DELETE) {
				dispatch(deleteObstacle({ id: id }));
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

	const resolveWheelAction = useCallback(
		(event: WheelEvent, data: App.IObstacle, snapTo: number) => {
			const id = resolveObstacleId(data);
			// if we're not hovering over an object, no need to fire the event.
			if (!hoveredId || hoveredId !== id) return;

			const delta = event.deltaY > 0 ? -1 : 1;
			const newDuration = data.duration + snapTo * delta;
			// the new duration value should never create an invalid obstacle.
			if (newDuration <= 0 || Math.abs(newDuration) < 0.01) return;

			dispatch(resizeObstacle({ id: id, newBeatDuration: data.duration + snapTo * delta }));
		},
		[dispatch, hoveredId],
	);

	const handleWheel = useCallback(
		(event: WheelEvent, data: App.IObstacle) => {
			event.preventDefault();
			if (event.altKey) {
				resolveWheelAction(event, data, snapTo);
			}
		},
		[resolveWheelAction, snapTo],
	);

	return obstacles.map((obstacle) => {
		const actualPosition = resolvePositionForObstacle(obstacle, { beatDepth });
		const obstacleDimensions = resolveDimensionsForObstacle(obstacle, { beatDepth });
		return (
			<Obstacle
				key={resolveObstacleId(obstacle)}
				data={obstacle}
				position={actualPosition}
				dimensions={obstacleDimensions}
				color={obstacleColor}
				onObstaclePointerDown={handlePointerDown}
				onObstaclePointerUp={handlePointerUp}
				onObstaclePointerOver={handlePointerOver}
				onObstaclePointerOut={handlePointerOut}
				onObstacleWheel={handleWheel}
			/>
		);
	});
}

export default EditorObstacles;
