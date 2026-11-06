import type { EntityId } from "@reduxjs/toolkit";
import { useParams } from "@tanstack/react-router";
import { type IWrapArc, type IWrapBombNote, type IWrapChain, type IWrapColorNote, type IWrapObstacle, mirrorNoteColor, type NoteColor, NoteDirection, SliderMidAnchorMode } from "bsmap";
import { Fragment, memo, useCallback, useMemo, useState } from "react";

import { Arc, BombNote, Chain, ColorNote, Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { calculateInlineRotations, resolvePositionForGridObject, resolvePositionForObstacle } from "$/components/scene/helpers";
import { useObjectPlacement } from "$/components/scene/hooks/use-object-placement";
import { Visualization } from "$/components/scene/layouts";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { resolveSliderId } from "$/helpers/sliders.helpers";
import { deselectArc, deselectBombNote, deselectChain, deselectColorNote, deselectObstacle, removeArc, removeBombNote, removeChain, removeColorNote, removeObstacle, selectArc, selectBombNote, selectChain, selectColorNote, selectObstacle, updateArc, updateChain, updateColorNote, updateObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllVisibleArcs, selectAllVisibleBombs, selectAllVisibleChains, selectAllVisibleNotes, selectAllVisibleObstacles, selectAnimateTrack, selectColorScheme, selectCursorPositionInBeats, selectHighestPrecision, selectNotesEditorAngleOffsetStep, selectSnap } from "$/store/selectors";
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

	const dispatch = useAppDispatch();
	const snapTo = useAppSelector(selectSnap);
	const animateTrack = useAppSelector(selectAnimateTrack);
	const highestPrecision = useAppSelector(selectHighestPrecision);
	const angleOffsetStep = useAppSelector(selectNotesEditorAngleOffsetStep);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const cursorPosition = useMemo(() => timescale(cursorPositionInBeats), [timescale, cursorPositionInBeats]);

	const notes = useAppSelector((state) => selectAllVisibleNotes(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));
	const bombs = useAppSelector((state) => selectAllVisibleBombs(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const arcs = useAppSelector((state) => selectAllVisibleArcs(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const chains = useAppSelector((state) => selectAllVisibleChains(state, sid, { timescale, beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));

	const handleUpdateColor = useCallback(
		(data: App.IWrapEditorObject<IWrapColorNote>, id: EntityId, color: NoteColor) => {
			dispatch(updateColorNote({ id, changes: { color } }));
			// when a note has the same grid position as the head/tail of a slider, align the colors for consistency.
			const arcWithMatchedHeadNote = arcs.find((x) => x.time === data.time && x.posX === data.posX && x.posY === data.posY);
			if (arcWithMatchedHeadNote && arcWithMatchedHeadNote.color !== color) {
				dispatch(updateArc({ id: resolveSliderId(arcWithMatchedHeadNote), changes: { color } }));
				dispatch(updateColorNote({ id: resolveNoteId({ time: arcWithMatchedHeadNote.tailTime, posX: arcWithMatchedHeadNote.tailPosX, posY: arcWithMatchedHeadNote.tailPosY }), changes: { color } }));
			}
			const arcWithMatchedTailNote = arcs.find((x) => x.tailTime === data.time && x.tailPosX === data.posX && x.tailPosY === data.posY);
			if (arcWithMatchedTailNote && arcWithMatchedTailNote.color !== color) {
				dispatch(updateArc({ id: resolveSliderId(arcWithMatchedTailNote), changes: { color } }));
				dispatch(updateColorNote({ id: resolveNoteId({ time: arcWithMatchedTailNote.time, posX: arcWithMatchedTailNote.posX, posY: arcWithMatchedTailNote.posY }), changes: { color } }));
			}
			const chainWithMatchedHeadNote = chains.find((x) => x.time === data.time && x.posX === data.posX && x.posY === data.posY);
			if (chainWithMatchedHeadNote) {
				dispatch(updateChain({ id: resolveSliderId(chainWithMatchedHeadNote), changes: { color } }));
			}
		},
		[dispatch, arcs, chains],
	);

	const handleUpdateDirection = useCallback(
		(data: App.IWrapEditorObject<IWrapColorNote>, id: EntityId, direction: number) => {
			dispatch(updateColorNote({ id, changes: { direction, angleOffset: 0 } }));
			// when a note has the same grid position as the head/tail of a slider, align the directions for consistency.
			const arcWithMatchedHeadNote = arcs.find((x) => x.time === data.time && x.posX === data.posX && x.posY === data.posY);
			if (arcWithMatchedHeadNote) {
				dispatch(updateArc({ id: resolveSliderId(arcWithMatchedHeadNote), changes: { direction: direction } }));
			}
			const arcWithMatchedTailNote = arcs.find((x) => x.tailTime === data.time && x.tailPosX === data.posX && x.tailPosY === data.posY);
			if (arcWithMatchedTailNote) {
				dispatch(updateArc({ id: resolveSliderId(arcWithMatchedTailNote), changes: { tailDirection: direction } }));
			}
			const chainWithMatchedHeadNote = chains.find((x) => x.time === data.time && x.posX === data.posX && x.posY === data.posY);
			if (chainWithMatchedHeadNote) {
				dispatch(updateChain({ id: resolveSliderId(chainWithMatchedHeadNote), changes: { direction: direction } }));
			}
		},
		[dispatch, arcs, chains],
	);

	const noteActions = useObjectPlacement<App.IWrapEditorObject<IWrapColorNote>>({
		interactive,
		selectId: resolveNoteId,
		onItemSelect: (_, id) => dispatch(selectColorNote({ id })),
		onItemDeselect: (_, id) => dispatch(deselectColorNote({ id })),
		onItemDelete: (_, id) => dispatch(removeColorNote({ id })),
		onItemModifyClick: (data, id) => {
			return handleUpdateColor(data, id, mirrorNoteColor(data.color));
		},
		onItemModifyKeys: (data, id, keys) => {
			if (keys.includes("W")) {
				if (keys.includes("A")) return handleUpdateDirection(data, id, NoteDirection.UP_LEFT);
				if (keys.includes("D")) return handleUpdateDirection(data, id, NoteDirection.UP_RIGHT);
				return handleUpdateDirection(data, id, NoteDirection.UP);
			}
			if (keys.includes("S")) {
				if (keys.includes("A")) return handleUpdateDirection(data, id, NoteDirection.DOWN_LEFT);
				if (keys.includes("D")) return handleUpdateDirection(data, id, NoteDirection.DOWN_RIGHT);
				return handleUpdateDirection(data, id, NoteDirection.DOWN);
			}
			if (keys.includes("A")) {
				if (keys.includes("W")) return handleUpdateDirection(data, id, NoteDirection.UP_LEFT);
				if (keys.includes("S")) return handleUpdateDirection(data, id, NoteDirection.DOWN_LEFT);
				return handleUpdateDirection(data, id, NoteDirection.LEFT);
			}
			if (keys.includes("D")) {
				if (keys.includes("W")) return handleUpdateDirection(data, id, NoteDirection.UP_RIGHT);
				if (keys.includes("S")) return handleUpdateDirection(data, id, NoteDirection.DOWN_RIGHT);
				return handleUpdateDirection(data, id, NoteDirection.RIGHT);
			}
			if (keys.includes("F")) {
				if (data.direction === NoteDirection.ANY) return dispatch(updateColorNote({ id, changes: { angleOffset: data.angleOffset === 0 ? 45 : 0 } }));
				return handleUpdateDirection(data, id, NoteDirection.ANY);
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
					return handleUpdateDirection(data, id, cycle(values, data.direction, delta > 0 ? 1 : -1));
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

	const arcActions = useObjectPlacement<App.IWrapEditorObject<IWrapArc>>({
		interactive,
		selectId: resolveSliderId,
		onItemSelect: (_, id) => dispatch(selectArc({ id })),
		onItemDeselect: (_, id) => dispatch(deselectArc({ id })),
		onItemDelete: (_, id) => dispatch(removeArc({ id })),
		onItemModifyClick: (data, id) => {
			const color = mirrorNoteColor(data.color);
			dispatch(updateArc({ id, changes: { color } }));
			// if this arc is connected to any notes, update them accordingly
			const arcWithMatchedHeadNote = notes.find((x) => x.time === data.time && x.posX === data.posX && x.posY === data.posY);
			if (arcWithMatchedHeadNote) {
				dispatch(updateColorNote({ id: resolveNoteId(arcWithMatchedHeadNote), changes: { color } }));
			}
			const arcWithMatchedTailNote = notes.find((x) => x.time === data.tailTime && x.posX === data.tailPosX && x.posY === data.tailPosY);
			if (arcWithMatchedTailNote) {
				dispatch(updateColorNote({ id: resolveNoteId(arcWithMatchedTailNote), changes: { color } }));
			}
		},
		onItemModifyKeys: (_, id, keys) => {
			if (keys.includes("W") || keys.includes("S")) return dispatch(updateArc({ id, changes: { midAnchor: SliderMidAnchorMode.STRAIGHT } }));
			if (keys.includes("A")) return dispatch(updateArc({ id, changes: { midAnchor: SliderMidAnchorMode.CLOCKWISE } }));
			if (keys.includes("D")) return dispatch(updateArc({ id, changes: { midAnchor: SliderMidAnchorMode.COUNTER_CLOCKWISE } }));
		},
		onItemModifyWheel: (data, id, delta) => {
			const step = delta > 0 ? 0.25 : -0.25;
			return dispatch(updateArc({ id, changes: { lengthMultiplier: Math.max(data.lengthMultiplier + step, 0), tailLengthMultiplier: Math.max(data.tailLengthMultiplier + step, 0) } }));
		},
	});

	const chainActions = useObjectPlacement<App.IWrapEditorObject<IWrapChain>>({
		interactive,
		selectId: resolveSliderId,
		onItemSelect: (_, id) => dispatch(selectChain({ id })),
		onItemDeselect: (_, id) => dispatch(deselectChain({ id })),
		onItemDelete: (_, id) => dispatch(removeChain({ id })),
		onItemModifyClick: (data, id) => {
			const color = mirrorNoteColor(data.color);
			dispatch(updateChain({ id, changes: { color } }));
			const chainWithMatchedHeadNote = notes.find((x) => x.time === data.time && x.posX === data.posX && x.posY === data.posY);
			if (chainWithMatchedHeadNote) {
				dispatch(updateColorNote({ id: resolveNoteId(chainWithMatchedHeadNote), changes: { color } }));
			}
		},
		onItemModifyWheel: (data, id, delta, modifierKey) => {
			if (modifierKey) {
				const step = delta > 0 ? 0.25 : -0.25;
				return dispatch(updateChain({ id, changes: { squish: Math.max(data.squish + step, 0.25) } }));
			} else {
				const step = delta > 0 ? 1 : -1;
				return dispatch(updateChain({ id, changes: { sliceCount: Math.max(data.sliceCount + step, 1) } }));
			}
		},
	});

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
								if (hoveredId === id) {
									return noteActions.handlePointerDown(e, data);
								}
							}}
							onWheel={(e) => {
								if (hoveredId === id) {
									return noteActions.handleWheel(e, data);
								}
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
								if (hoveredId === id) {
									return bombActions.handlePointerDown(e, data);
								}
							}}
							onWheel={(e) => {
								if (hoveredId === id) {
									return bombActions.handleWheel(e, data);
								}
							}}
						/>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={obstacles} resolveId={resolveObstacleId} resolvePosition={resolvePositionForObstacle} resolveColor={() => resolveColorForItem(ObjectTool.OBSTACLE, { colorScheme })}>
					{(data, id, props) => (
						<Obstacle
							key={id}
							{...props}
							timescale={timescale}
							beatDepth={beatDepth}
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
								if (hoveredId === id) {
									return obstacleActions.handlePointerDown(e, data);
								}
							}}
							onWheel={(e) => {
								if (hoveredId === id) {
									return obstacleActions.handleWheel(e, data);
								}
							}}
						/>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={arcs} resolveId={resolveSliderId} resolvePosition={resolvePositionForGridObject} resolveColor={(data) => resolveColorForItem(Object.values(ObjectTool)[data.color], { colorScheme })}>
					{(data, id, props) => (
						<Arc interactive={interactive} key={id} {...props} timescale={timescale} beatDepth={beatDepth}>
							{({ HeadControlPoint, TailControlPoint }) => (
								<Fragment>
									{interactive && (
										<HeadControlPoint
											onPointerOver={(e) => {
												e.stopPropagation();
												setHoveredId(id);
												arcActions.handlePointerOver(e, data);
											}}
											onPointerOut={(e) => {
												setHoveredId(null);
												arcActions.handlePointerOut(e, data);
											}}
											onPointerDown={(e) => {
												if (hoveredId === id) {
													return arcActions.handlePointerDown(e, data);
												}
											}}
											onWheel={(e) => {
												if (hoveredId === id) {
													return arcActions.handleWheel(e, data);
												}
											}}
										/>
									)}
									{interactive && (
										<TailControlPoint
											onPointerOver={(e) => {
												e.stopPropagation();
												setHoveredId(id);
												arcActions.handlePointerOver(e, data);
											}}
											onPointerOut={(e) => {
												setHoveredId(null);
												arcActions.handlePointerOut(e, data);
											}}
											onPointerDown={(e) => {
												if (hoveredId === id) {
													return arcActions.handlePointerDown(e, data);
												}
											}}
											onWheel={(e) => {
												if (hoveredId !== id) {
													return arcActions.handleWheel(e, data);
												}
											}}
										/>
									)}
								</Fragment>
							)}
						</Arc>
					)}
				</Visualization.ForGridObjects>
				<Visualization.ForGridObjects objects={chains} resolveId={resolveSliderId} resolvePosition={resolvePositionForGridObject} resolveColor={(data) => resolveColorForItem(Object.values(ObjectTool)[data.color], { colorScheme })}>
					{(data, id, props) => (
						<Chain interactive={interactive} key={id} {...props} timescale={timescale} beatDepth={beatDepth}>
							{({ TailControlPoint }) => (
								<Fragment>
									{interactive && (
										<TailControlPoint
											onPointerOver={(e) => {
												e.stopPropagation();
												setHoveredId(id);
												chainActions.handlePointerOver(e, data);
											}}
											onPointerOut={(e) => {
												setHoveredId(null);
												chainActions.handlePointerOut(e, data);
											}}
											onPointerDown={(e) => {
												if (hoveredId === id) {
													return chainActions.handlePointerDown(e, data);
												}
											}}
											onWheel={(e) => {
												if (hoveredId === id) {
													return chainActions.handleWheel(e, data);
												}
											}}
										/>
									)}
								</Fragment>
							)}
						</Chain>
					)}
				</Visualization.ForGridObjects>
			</Visualization.Mover>
			{interactive && <EditorPlacementGrid position-z={-SONG_OFFSET} />}
		</Visualization.Root>
	);
}

export default memo(MapVisualization);
