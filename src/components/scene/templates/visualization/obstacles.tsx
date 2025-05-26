import type { EntityId } from "@reduxjs/toolkit";
import { useCallback, useMemo, useState } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { deselectObstacle, removeObstacle, selectObstacle, updateObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleObstacles, selectColorScheme, selectNotesEditorSelectionMode, selectSnap } from "$/store/selectors";
import { type App, type BeatmapId, ObjectSelectionMode, ObjectTool, type SongId } from "$/types";

import { Obstacle, resolveDimensionsForObstacle, resolvePositionForObstacle } from "$/components/scene/compositions";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
}
function EditorObstacles({ sid, bid, beatDepth, surfaceDepth, interactive }: Props) {
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const snapTo = useAppSelector(selectSnap);
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
		(event: PointerEvent, data: App.IObstacle) => {
			if (!interactive) return;
			event.stopPropagation();
			const id = resolveObstacleId(data);

			if (event.buttons === 2) {
				dispatch(removeObstacle({ id: id }));
			}
		},
		[dispatch, interactive],
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent, obstacle: App.IObstacle) => {
			if (!interactive) return;
			event.stopPropagation();

			if (obstacle.tentative) return;
			// if we're selecting obstacles
			if (selectionMode && hoveredId) return;

			if (event.buttons === 0) {
				resolveClickAction(obstacle);
			}
		},
		[interactive, selectionMode, hoveredId, resolveClickAction],
	);

	const handlePointerOver = useCallback(
		(event: PointerEvent, obstacle: App.IObstacle) => {
			if (!interactive) return;
			event.stopPropagation();
			const id = resolveObstacleId(obstacle);
			setHoveredId(id);
			switch (selectionMode) {
				case ObjectSelectionMode.SELECT:
				case ObjectSelectionMode.DESELECT: {
					const alreadySelected = obstacle.selected && selectionMode === ObjectSelectionMode.SELECT;
					const alreadyDeselected = !obstacle.selected && selectionMode === ObjectSelectionMode.DESELECT;
					if (alreadySelected || alreadyDeselected) return;
					const action = !obstacle.selected ? selectObstacle : deselectObstacle;
					return dispatch(action({ id: id }));
				}
				case ObjectSelectionMode.DELETE: {
					return dispatch(removeObstacle({ id: id }));
				}
				default: {
					return;
				}
			}
		},
		[dispatch, interactive, selectionMode],
	);

	const handlePointerOut = useCallback(
		(event: PointerEvent) => {
			if (!interactive) return;
			event.stopPropagation();
			setHoveredId(null);
		},
		[interactive],
	);

	const resolveWheelAction = useCallback(
		(event: WheelEvent, data: App.IObstacle, snapTo: number) => {
			if (!interactive) return;
			event.stopPropagation();
			const id = resolveObstacleId(data);
			// if we're not hovering over an object, no need to fire the event.
			if (!hoveredId || hoveredId !== id) return;

			const delta = event.deltaY > 0 ? -1 : 1;
			const newDuration = data.duration + snapTo * delta;
			// the new duration value should never create an invalid obstacle.
			if (newDuration <= 0 || Math.abs(newDuration) < 0.01) return;

			dispatch(updateObstacle({ id: id, changes: { duration: data.duration + snapTo * delta } }));
		},
		[dispatch, interactive, hoveredId],
	);

	const handleWheel = useCallback(
		(event: WheelEvent, data: App.IObstacle) => {
			if (!interactive) return;
			event.preventDefault();
			if (event.altKey) {
				resolveWheelAction(event, data, snapTo);
			}
		},
		[interactive, resolveWheelAction, snapTo],
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
