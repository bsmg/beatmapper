import type { ThreeEvent } from "@react-three/fiber";
import type { EntityId } from "@reduxjs/toolkit";
import { useParams } from "@tanstack/react-router";
import { type IWrapBombNote, type IWrapColorNote, type IWrapObstacle, mirrorNoteColor, NoteDirection } from "bsmap";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { Object3D } from "three";

import { BombNote, ColorNote, Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { calculateInlineRotations, resolvePositionForGridObject, resolvePositionForObstacle } from "$/components/scene/helpers";
import { useObjectPlacement } from "$/components/scene/hooks/use-object-placement";
import { Visualization } from "$/components/scene/layouts";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { isBombNote, isColorNote, resolveNoteId } from "$/helpers/notes.helpers";
import { isObstacle, resolveObstacleId } from "$/helpers/obstacles.helpers";
import { deselectBombNote, deselectColorNote, deselectObstacle, removeBombNote, removeColorNote, removeObstacle, selectBombNote, selectColorNote, selectObstacle, updateColorNote, updateObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleBombs, selectAllVisibleNotes, selectAllVisibleObstacles, selectAnimateTrack, selectColorScheme, selectCursorPositionInBeats, selectHighestPrecision, selectNotesEditorAngleOffsetStep, selectNotesEditorSelectionMode, selectSnap } from "$/store/selectors";
import { type App, ObjectTool } from "$/types";
import { cycle, roundToNearest } from "$/utils";
import EditorBeatMarkers from "./beat-markers";
import EditorPlacementGrid from "./placement-grid";

interface Props {
	timescale: (time: number) => number;
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
}
/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
function MapVisualization({ timescale, beatDepth, surfaceDepth, interactive }: Props) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const isDispatchingEvent = useRef(false);

	const dispatch = useAppDispatch();
	const snapTo = useAppSelector(selectSnap);
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const animateTrack = useAppSelector(selectAnimateTrack);
	const highestPrecision = useAppSelector(selectHighestPrecision);
	const angleOffsetStep = useAppSelector(selectNotesEditorAngleOffsetStep);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const cursorPosition = useMemo(() => timescale(cursorPositionInBeats), [timescale, cursorPositionInBeats]);

	const notes = useAppSelector((state) => selectAllVisibleNotes(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));
	const bombs = useAppSelector((state) => selectAllVisibleBombs(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));

	const noteActions = useObjectPlacement<App.IWrapEditorObject<IWrapColorNote>>({
		interactive,
		selectId: resolveNoteId,
		onItemSelect: (_, id) => dispatch(selectColorNote({ id })),
		onItemDeselect: (_, id) => dispatch(deselectColorNote({ id })),
		onItemDelete: (_, id) => dispatch(removeColorNote({ id })),
		onItemModifyClick: (data, id) => {
			return dispatch(updateColorNote({ id, changes: { color: mirrorNoteColor(data.color) } }));
		},
		onItemModifyKeys: (data, id, keys) => {
			if (keys.includes("W")) {
				if (keys.includes("A")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.UP_LEFT, angleOffset: 0 } }));
				if (keys.includes("D")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.UP_RIGHT, angleOffset: 0 } }));
				return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.UP, angleOffset: 0 } }));
			}
			if (keys.includes("S")) {
				if (keys.includes("A")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.DOWN_LEFT, angleOffset: 0 } }));
				if (keys.includes("D")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.DOWN_RIGHT, angleOffset: 0 } }));
				return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.DOWN, angleOffset: 0 } }));
			}
			if (keys.includes("A")) {
				if (keys.includes("W")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.UP_LEFT, angleOffset: 0 } }));
				if (keys.includes("S")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.DOWN_LEFT, angleOffset: 0 } }));
				return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.LEFT, angleOffset: 0 } }));
			}
			if (keys.includes("D")) {
				if (keys.includes("W")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.UP_RIGHT, angleOffset: 0 } }));
				if (keys.includes("S")) return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.DOWN_RIGHT, angleOffset: 0 } }));
				return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.RIGHT, angleOffset: 0 } }));
			}
			if (keys.includes("F")) {
				if (data.direction === NoteDirection.ANY) return dispatch(updateColorNote({ id, changes: { angleOffset: data.angleOffset === 0 ? 45 : 0 } }));
				return dispatch(updateColorNote({ id, changes: { direction: NoteDirection.ANY, angleOffset: 0 } }));
			}
		},
		onItemModifyWheel: (data, id, delta, modifierKey) => {
			if (modifierKey) {
				const step = angleOffsetStep / delta;
				if (Object.values<number>(NoteDirection).includes(data.direction)) {
					return dispatch(updateColorNote({ id, changes: { angleOffset: (data.angleOffset ?? 0) + step } }));
				}
			} else {
				const values: number[] = [NoteDirection.UP, NoteDirection.UP_LEFT, NoteDirection.LEFT, NoteDirection.DOWN_LEFT, NoteDirection.DOWN, NoteDirection.DOWN_RIGHT, NoteDirection.RIGHT, NoteDirection.UP_RIGHT];
				if (values.includes(data.direction)) {
					return dispatch(updateColorNote({ id, changes: { direction: cycle(values, data.direction, delta > 0 ? 1 : -1), angleOffset: 0 } }));
				}
			}
		},
	});

	const bombActions = useObjectPlacement<App.IWrapEditorObject<IWrapBombNote>>({
		interactive,
		selectId: resolveNoteId,
		onItemSelect: (_, id) => dispatch(selectBombNote({ id })),
		onItemDeselect: (_, id) => dispatch(deselectBombNote({ id })),
		onItemDelete: (_, id) => dispatch(removeBombNote({ id })),
	});

	const obstacleActions = useObjectPlacement<App.IWrapEditorObject<IWrapObstacle>>({
		interactive,
		selectId: resolveObstacleId,
		onItemSelect: (_, id) => dispatch(selectObstacle({ id })),
		onItemDeselect: (_, id) => dispatch(deselectObstacle({ id })),
		onItemDelete: (_, id) => dispatch(removeObstacle({ id })),
		onItemModifyWheel: (x, id, delta) => {
			const newDuration = roundToNearest(x.duration + snapTo * delta, highestPrecision);
			// the new duration value should never create an invalid obstacle.
			dispatch(updateObstacle({ id, changes: { duration: Math.max(newDuration, highestPrecision) } }));
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
	const handleCellPointerDown = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			if (selectionMode) return;
			if (isDispatchingEvent.current) return;
			// ignore left click, since we don't want passthrough to take priority over placements
			if (event.button === 0) return;

			const target = event.intersections.find(({ object }) => isColorNote(object.userData) || isBombNote(object.userData) || isObstacle(object.userData));

			if (target) {
				isDispatchingEvent.current = true;
				try {
					const data = deriveUserDataFromTarget(target.object);
					if (isColorNote(data)) return noteActions.handlePointerDown(event, data);
					if (isBombNote(data)) return bombActions.handlePointerDown(event, data);
					if (isObstacle(data)) return obstacleActions.handlePointerDown(event, data);
				} finally {
					isDispatchingEvent.current = false;
				}
			}
		},
		[selectionMode, deriveUserDataFromTarget, noteActions.handlePointerDown, bombActions.handlePointerDown, obstacleActions.handlePointerDown],
	);

	const handleCellWheel = useCallback(
		(event: ThreeEvent<WheelEvent>) => {
			if (selectionMode) return;
			if (isDispatchingEvent.current) return;

			const target = event.intersections.find(({ object }) => isColorNote(object.userData) || isBombNote(object.userData) || isObstacle(object.userData));

			if (target) {
				isDispatchingEvent.current = true;
				try {
					const data = deriveUserDataFromTarget(target.object);
					if (isColorNote(data)) return noteActions.handleWheel(event, data);
					if (isBombNote(data)) return bombActions.handleWheel(event, data);
					if (isObstacle(data)) return obstacleActions.handleWheel(event, data);
					return;
				} finally {
					isDispatchingEvent.current = false;
				}
			}
		},
		[selectionMode, deriveUserDataFromTarget, noteActions.handleWheel, bombActions.handleWheel, obstacleActions.handleWheel],
	);

	const rotationOverrides = useMemo(() => {
		if (interactive) {
			return new Map<EntityId, number>();
		}
		return calculateInlineRotations(notes);
	}, [notes, interactive]);

	const [hoveredId, setHoveredId] = useState<EntityId | null>(null);

	return (
		<Visualization.Root cursorPosition={cursorPosition} timescale={timescale} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={!!interactive}>
			<Visualization.Mover immediate={!animateTrack}>
				{interactive && <EditorBeatMarkers timescale={timescale} beatDepth={beatDepth} />}
				<Visualization.ForGridObjects objects={notes} resolveId={resolveNoteId} resolvePosition={resolvePositionForGridObject} resolveColor={(data) => resolveColorForItem(Object.values(ObjectTool)[data.color], { colorScheme })}>
					{(data, id, props) => (
						<ColorNote
							key={id}
							{...props}
							rotationOffset={rotationOverrides.get(id)}
							onPointerOver={(e) => {
								e.stopPropagation();
								setHoveredId(id);
								noteActions.handlePointerOver(e, data);
							}}
							onPointerOut={(e) => {
								setHoveredId(null);
								noteActions.handlePointerOut(e, data);
							}}
							onPointerDown={(e) => {
								if (hoveredId !== id) return;
								noteActions.handlePointerDown(e, data);
							}}
							onWheel={(e) => {
								if (hoveredId !== id) return;
								noteActions.handleWheel(e, data);
							}}
						/>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={bombs} resolveId={resolveNoteId} resolvePosition={resolvePositionForGridObject} resolveColor={() => resolveColorForItem(ObjectTool.BOMB_NOTE, { colorScheme })}>
					{(data, id, props) => (
						<BombNote
							key={id}
							{...props}
							onPointerOver={(e) => {
								e.stopPropagation();
								setHoveredId(id);
								bombActions.handlePointerOver(e, data);
							}}
							onPointerOut={(e) => {
								setHoveredId(null);
								bombActions.handlePointerOut(e, data);
							}}
							onPointerDown={(e) => {
								if (hoveredId !== id) return;
								bombActions.handlePointerDown(e, data);
							}}
							onWheel={(e) => {
								if (hoveredId !== id) return;
								bombActions.handleWheel(e, data);
							}}
						/>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={obstacles} resolveId={resolveObstacleId} resolvePosition={resolvePositionForObstacle} resolveColor={() => resolveColorForItem(ObjectTool.OBSTACLE, { colorScheme })}>
					{(data, id, props) => (
						<Obstacle
							key={id}
							layers={1}
							timescale={timescale}
							beatDepth={beatDepth}
							{...props}
							onPointerOver={(e) => {
								e.stopPropagation();
								setHoveredId(id);
								obstacleActions.handlePointerOver(e, data);
							}}
							onPointerOut={(e) => {
								setHoveredId(null);
								obstacleActions.handlePointerOut(e, data);
							}}
							onPointerDown={(e) => {
								if (hoveredId !== id) return;
								obstacleActions.handlePointerDown(e, data);
							}}
							onWheel={(e) => {
								if (hoveredId !== id) return;
								obstacleActions.handleWheel(e, data);
							}}
						/>
					)}
				</Visualization.ForGridObjects>
			</Visualization.Mover>
			{interactive && <EditorPlacementGrid position-z={-SONG_OFFSET} onCellPointerDown={handleCellPointerDown} onCellWheel={handleCellWheel} />}
		</Visualization.Root>
	);
}

export default memo(MapVisualization);
