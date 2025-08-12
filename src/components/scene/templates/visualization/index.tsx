import { type ThreeEvent, useThree } from "@react-three/fiber";
import { NoteDirection } from "bsmap";
import { Fragment, useCallback, useRef } from "react";
import type { Object3D } from "three";

import { TrackMover } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { useControls, useObjectPlacement } from "$/components/scene/hooks";
import { isBombNote, isColorNote, resolveNoteId } from "$/helpers/notes.helpers";
import { isObstacle, resolveObstacleId } from "$/helpers/obstacles.helpers";
import { deselectNote, deselectObstacle, mirrorColorNote, removeNote, removeObstacle, selectNote, selectObstacle, updateColorNote, updateObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNotesEditorSelectionMode, selectSnap } from "$/store/selectors";
import type { App, BeatmapId, SongId } from "$/types";
import EditorBeatMarkers from "./markers";
import EditorNotes from "./notes";
import EditorObstacles from "./obstacles";
import EditorPlacementGrid from "./placement-grid";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
}
/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
function MapVisualization({ sid, bid, beatDepth, surfaceDepth, interactive }: Props) {
	useControls();

	const { raycaster, scene } = useThree((state) => state);

	const isDispatchingEvent = useRef(false);
	const dispatch = useAppDispatch();
	const snapTo = useAppSelector(selectSnap);
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);

	const notes = useObjectPlacement<App.IBaseNote>({
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

	const obstacles = useObjectPlacement<App.IObstacle>({
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
					if (isObstacle(data)) return obstacles.handlePointerDown(event.nativeEvent, data);
					if (isColorNote(data) || isBombNote(data)) return notes.handlePointerDown(event.nativeEvent, data);
				} finally {
					isDispatchingEvent.current = false;
				}
			}
		},
		[raycaster, scene, selectionMode, deriveUserDataFromTarget, notes.handlePointerDown, obstacles.handlePointerDown],
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
					if (isObstacle(data)) return obstacles.handleWheel(event.nativeEvent, data);
					if (isColorNote(data)) return notes.handleWheel(event.nativeEvent, data);
					return;
				} finally {
					isDispatchingEvent.current = false;
				}
			}
		},
		[raycaster, scene, selectionMode, deriveUserDataFromTarget, notes.handleWheel, obstacles.handleWheel],
	);

	return (
		<Fragment>
			<TrackMover sid={sid} beatDepth={beatDepth}>
				{interactive && <EditorBeatMarkers sid={sid} />}
				<EditorNotes sid={sid} bid={bid} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={interactive} {...notes} />
				<EditorObstacles sid={sid} bid={bid} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={interactive} {...obstacles} />
			</TrackMover>
			{interactive && <EditorPlacementGrid sid={sid} bid={bid} position-z={-SONG_OFFSET} onCellPointerDown={handleCellPointerDown} onCellWheel={handleCellWheel} />}
		</Fragment>
	);
}

export default MapVisualization;
