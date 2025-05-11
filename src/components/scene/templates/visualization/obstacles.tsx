import type { EntityId } from "@reduxjs/toolkit";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useCallback, useMemo, useState } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { deleteObstacle, deselectObstacle, resizeObstacle, selectObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleObstacles, selectBeatDepth, selectCustomColors, selectNoteEditorSelectionMode, selectSnapTo } from "$/store/selectors";
import { type App, ObjectSelectionMode, ObjectTool, type SongId } from "$/types";

import { Obstacle } from "$/components/scene/compositions";

interface Props {
	sid: SongId;
}
function EditorObstacles({ sid }: Props) {
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid));
	const beatDepth = useAppSelector(selectBeatDepth);
	const selectionMode = useAppSelector(selectNoteEditorSelectionMode);
	const snapTo = useAppSelector(selectSnapTo);
	const dispatch = useAppDispatch();

	const [hoveredId, setHoveredId] = useState<EntityId | null>(null);

	const obstacleColor = useMemo(() => resolveColorForItem(ObjectTool.OBSTACLE, customColors), [customColors]);

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

	const resolveWheelAction = useDebouncedCallback(
		(ev: WheelEvent, obstacle: App.IObstacle, snapTo: number) => {
			const id = resolveObstacleId(obstacle);
			const delta = ev.deltaY > 0 ? -1 : 1;
			const newDuration = obstacle.duration + snapTo * delta;
			// the new duration value should never create an invalid obstacle.
			if (newDuration <= 0 || Math.abs(newDuration) < 0.01) return;

			dispatch(resizeObstacle({ id: id, newBeatDuration: obstacle.duration + snapTo * delta }));
		},
		{ wait: 50 },
	);

	const handleWheel = useCallback(
		(ev: WheelEvent, obstacle: App.IObstacle) => {
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
		<Obstacle key={resolveObstacleId(obstacle)} data={obstacle} color={obstacleColor} beatDepth={beatDepth} onObstaclePointerDown={handlePointerDown} onObstaclePointerUp={handlePointerUp} onObstaclePointerOver={handlePointerOver} onObstaclePointerOut={handlePointerOut} onObstacleWheel={handleWheel} />
	));
}

export default EditorObstacles;
