import { type ThreeEvent, useThree } from "@react-three/fiber";
import { useParams } from "@tanstack/react-router";
import { NoteDirection } from "bsmap";
import { useCallback, useRef } from "react";
import type { Object3D } from "three";

import { BombNote, ColorNote, Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { resolvePositionForGridObject, resolvePositionForObstacle } from "$/components/scene/helpers";
import { useControls, useObjectPlacement } from "$/components/scene/hooks";
import { Visualization } from "$/components/scene/layouts";
import { isBombNote, isColorNote, resolveNoteId } from "$/helpers/notes.helpers";
import { isObstacle, resolveObstacleId } from "$/helpers/obstacles.helpers";
import { deselectNote, deselectObstacle, mirrorColorNote, removeNote, removeObstacle, selectNote, selectObstacle, updateColorNote, updateObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleObstacles, selectNotesEditorSelectionMode, selectSnap, selectVisibleBombs, selectVisibleNotes } from "$/store/selectors";
import { type App, ObjectTool } from "$/types";
import EditorBeatMarkers from "./beat-markers";
import EditorPlacementGrid from "./placement-grid";

interface Props {
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
}
/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
function MapVisualization({ beatDepth, surfaceDepth, interactive }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	useControls();

	const { raycaster, scene } = useThree((state) => state);

	const isDispatchingEvent = useRef(false);
	const dispatch = useAppDispatch();
	const snapTo = useAppSelector(selectSnap);
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);

	const notes = useAppSelector((state) => selectVisibleNotes(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));
	const bombs = useAppSelector((state) => selectVisibleBombs(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));

	const noteActions = useObjectPlacement<App.IBaseNote>({
		interactive,
		selectId: resolveNoteId,
		selectItemSelected: (x) => !!x.selected,
		onItemSelect: (x) => dispatch(selectNote({ query: x })),
		onItemDeselect: (x) => dispatch(deselectNote({ query: x })),
		onItemDelete: (x) => dispatch(removeNote({ query: x })),
		onItemModify: (x) => dispatch(mirrorColorNote({ query: x })),
		onItemWheel: (x, delta) => {
			if (!isColorNote(x)) return;
			const step = 15 / delta;
			if (Object.values<number>(NoteDirection).includes(x.direction)) {
				return dispatch(updateColorNote({ query: x, changes: { angleOffset: (x.angleOffset ?? 0) + step } }));
			}
		},
	});

	const obstacleActions = useObjectPlacement<App.IObstacle>({
		interactive,
		selectId: resolveObstacleId,
		selectItemSelected: (x) => !!x.selected,
		onItemSelect: (x) => dispatch(selectObstacle({ id: resolveObstacleId(x) })),
		onItemDeselect: (x) => dispatch(deselectObstacle({ id: resolveObstacleId(x) })),
		onItemDelete: (x) => dispatch(removeObstacle({ id: resolveObstacleId(x) })),
		onItemWheel: (x, delta) => {
			const newDuration = x.duration + snapTo * delta;
			// the new duration value should never create an invalid obstacle.
			if (newDuration <= 0 || Math.abs(newDuration) < 0.01) return;
			dispatch(updateObstacle({ id: resolveObstacleId(x), changes: { duration: x.duration + snapTo * delta } }));
		},
	});

	const deriveUserDataFromTarget = useCallback(<T extends object>(object: Object3D) => {
		let userData = {} as T;
		let current: Object3D | null = object;
		while (current !== null) {
			userData = { ...current.userData, ...userData };
			current = current.parent;
		}
		return userData;
	}, []);

	// pointer events should pass through when we're not in bulk selection mode.
	// todo: this logic should probably be deduplicated at a higher level, but that's for future me to worry about.
	const handleCellPointerDown = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			if (selectionMode) return;
			if (isDispatchingEvent.current) return;
			// ignore left click, since we don't want passthrough to take priority over placements
			if (event.button === 0) return;

			const intersects = raycaster.intersectObjects(scene.children, true);

			if (intersects.length > 1) {
				const target = intersects[1].object;

				isDispatchingEvent.current = true;
				try {
					const data = deriveUserDataFromTarget(target);
					if (isObstacle(data)) return obstacleActions.handlePointerDown(event.nativeEvent, data);
					if (isColorNote(data) || isBombNote(data)) return noteActions.handlePointerDown(event.nativeEvent, data);
				} finally {
					isDispatchingEvent.current = false;
				}
			}
		},
		[raycaster, scene, selectionMode, deriveUserDataFromTarget, noteActions.handlePointerDown, obstacleActions.handlePointerDown],
	);

	const handleCellWheel = useCallback(
		(event: ThreeEvent<WheelEvent>) => {
			if (selectionMode) return;
			if (isDispatchingEvent.current) return;

			const intersects = raycaster.intersectObjects(scene.children, true);

			if (intersects.length > 1) {
				const target = intersects[1].object;

				isDispatchingEvent.current = true;
				try {
					const data = deriveUserDataFromTarget(target);
					if (isObstacle(data)) return obstacleActions.handleWheel(event.nativeEvent, data);
					if (isColorNote(data)) return noteActions.handleWheel(event.nativeEvent, data);
					return;
				} finally {
					isDispatchingEvent.current = false;
				}
			}
		},
		[raycaster, scene, selectionMode, deriveUserDataFromTarget, noteActions.handleWheel, obstacleActions.handleWheel],
	);

	return (
		<Visualization.Root beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={!!interactive}>
			<Visualization.Mover>
				{interactive && <EditorBeatMarkers beatDepth={beatDepth} />}
				<Visualization.ForGridObjects objects={notes} resolvePosition={resolvePositionForGridObject} resolveColor={(data) => Object.values(ObjectTool)[data.color]}>
					{(data, props) => (
						<ColorNote
							key={resolveNoteId(data)}
							layers={1}
							{...props}
							onPointerDown={(e) => noteActions.handlePointerDown(e.nativeEvent, data)}
							onPointerOver={(e) => noteActions.handlePointerOver(e.nativeEvent, data)}
							onPointerOut={(e) => noteActions.handlePointerOut(e.nativeEvent, data)}
							onWheel={(e) => noteActions.handleWheel(e.nativeEvent, data)}
						/>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={bombs} resolvePosition={resolvePositionForGridObject} resolveColor={() => ObjectTool.BOMB_NOTE}>
					{(data, props) => (
						<BombNote
							key={resolveNoteId(data)}
							layers={1}
							{...props}
							onPointerDown={(e) => noteActions.handlePointerDown(e.nativeEvent, data)}
							onPointerOver={(e) => noteActions.handlePointerOver(e.nativeEvent, data)}
							onPointerOut={(e) => noteActions.handlePointerOut(e.nativeEvent, data)}
							onWheel={(e) => noteActions.handleWheel(e.nativeEvent, data)}
						/>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={obstacles} resolvePosition={resolvePositionForObstacle} resolveColor={() => ObjectTool.OBSTACLE}>
					{(data, props) => (
						<Obstacle
							key={resolveObstacleId(data)}
							layers={1}
							beatDepth={beatDepth}
							{...props}
							onPointerDown={(e) => obstacleActions.handlePointerDown(e.nativeEvent, data)}
							onPointerOver={(e) => obstacleActions.handlePointerOver(e.nativeEvent, data)}
							onPointerOut={(e) => obstacleActions.handlePointerOut(e.nativeEvent, data)}
							onWheel={(e) => obstacleActions.handleWheel(e.nativeEvent, data)}
						/>
					)}
				</Visualization.ForGridObjects>
			</Visualization.Mover>
			{interactive && <EditorPlacementGrid position-z={-SONG_OFFSET} onCellPointerDown={handleCellPointerDown} onCellWheel={handleCellWheel} />}
		</Visualization.Root>
	);
}

export default MapVisualization;
