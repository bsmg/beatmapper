import { useHotkeyStore } from "@ark-ui/react/hotkeys";
import type { ThreeEvent } from "@react-three/fiber";
import { useParams } from "@tanstack/react-router";
import { useMachine } from "@zag-js/react";
import { NoteDirection } from "bsmap";
import { type ComponentProps, useCallback, useRef } from "react";

import { Arc, BombNote, Chain, ColorNote, Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { resolvePositionForGridObject, resolvePositionForObstacle } from "$/components/scene/helpers";
import { PlacementGrid } from "$/components/scene/layouts";
import type { IPlacementContext } from "$/components/scene/layouts/placement-grid/machine";
import { Match, Switch } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { createBombNoteFromMouseEvent, createColorNoteFromMouseEvent } from "$/helpers/notes.helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { createArcFromMouseEvent, createChainFromMouseEvent } from "$/helpers/sliders.helpers";
import { addArc, addBombNote, addChain, addColorNote, addObstacle } from "$/store/actions";
import { selectAllNotes } from "$/store/features/objects.slice";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCursorPositionInBeats, selectGridSize, selectHighestPrecision, selectNotePlacementMode, selectNotesEditorColor, selectNotesEditorDirection, selectNotesEditorSelectionMode, selectNotesEditorType, selectObstaclePlacementMode, selectTrackScale } from "$/store/selectors";
import { ColorSchemeKey, type IGrid, type NotePlacementMode, ObjectColor, ObjectType } from "$/types";

function EditorPlacementGrid({ ...rest }: ComponentProps<"group">) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const notePlacementMode = useAppSelector((state) => selectNotePlacementMode(state, sid));
	const obstaclePlacementMode = useAppSelector((state) => selectObstaclePlacementMode(state, sid));
	const grid = useAppSelector((state) => selectGridSize(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedType = useAppSelector(selectNotesEditorType);
	const selectedColor = useAppSelector(selectNotesEditorColor);
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const notes = useAppSelector(selectAllNotes);
	const beatDepth = useAppSelector(selectTrackScale);
	const highestPrecision = useAppSelector(selectHighestPrecision);

	const hotkeys = useHotkeyStore();

	const activeType = useRef<ObjectType>(null);

	const shouldLockCursor = (type: ObjectType | null): boolean => {
		return type !== ObjectType.OBSTACLE && type !== ObjectType.ARC && type !== ObjectType.CHAIN;
	};

	const handleCreateArc = useCallback(
		(ctx: Pick<IPlacementContext, "anchorBeat" | "cellDownAt" | "cellOverAt" | "time" | "duration">, mode: NotePlacementMode, grid: IGrid) => {
			const headTime = ctx.anchorBeat ?? 0;
			const headNote = notes.find((x) => x.time === headTime && x.posX === ctx.cellDownAt?.colIndex && x.posY === ctx.cellDownAt?.rowIndex);
			const tailTime = headTime + (ctx.duration ?? 0);
			const tailNote = notes.find((x) => x.time === tailTime && x.posX === ctx.cellOverAt?.colIndex && x.posY === ctx.cellOverAt?.rowIndex);

			const data = createArcFromMouseEvent(ctx, mode, grid, {
				color: headNote?.color ?? (selectedColor === ObjectColor.LEFT ? 0 : 1),
				direction: headNote?.direction ?? NoteDirection.ANY,
				tailDirection: tailNote?.direction ?? selectedDirection,
			});

			return data;
		},
		[notes, selectedColor, selectedDirection],
	);

	const handleCreateChain = useCallback(
		(ctx: Pick<IPlacementContext, "anchorBeat" | "cellDownAt" | "cellOverAt" | "time" | "duration">, mode: NotePlacementMode, grid: IGrid) => {
			const headTime = ctx.anchorBeat ?? 0;
			const headNote = notes.find((x) => x.time === headTime && x.posX === ctx.cellDownAt?.colIndex && x.posY === ctx.cellDownAt?.rowIndex);

			const data = createChainFromMouseEvent(ctx, mode, grid, {
				color: headNote?.color ?? (selectedColor === ObjectColor.LEFT ? 0 : 1),
				direction: headNote?.direction ?? NoteDirection.ANY,
			});
			return data;
		},
		[notes, selectedColor],
	);

	const service = useMachine(PlacementGrid.machine, {
		notePlacementMode,
		obstaclePlacementMode,
		grid,
		cursorPositionInBeats,
		selectedType,
		shouldLockCursor,
		onCellPointerDown: (_, _ctx, { type }) => {
			if (selectionMode) return;

			if (shouldLockCursor(type)) {
				hotkeys.removeScope("navigation");
			}

			activeType.current = type;
		},
		onPointerUp: (_, ctx, { type }) => {
			if (selectionMode) return;

			if (!hotkeys.getActiveScopes().includes("navigation")) {
				hotkeys.addScope("navigation");
			}

			switch (type) {
				case ObjectType.NOTE: {
					const note = createColorNoteFromMouseEvent(ctx, notePlacementMode, grid, {
						color: selectedColor === ObjectColor.LEFT ? 0 : 1,
						direction: Math.round(ctx.direction ?? selectedDirection),
					});
					if (note) return dispatch(addColorNote(note));
					break;
				}
				case ObjectType.BOMB: {
					const note = createBombNoteFromMouseEvent(ctx, notePlacementMode, grid);
					if (note) return dispatch(addBombNote(note));
					break;
				}
				case ObjectType.OBSTACLE: {
					const obstacle = createObstacleFromMouseEvent(ctx, obstaclePlacementMode, grid, { duration: Math.max(ctx.duration ?? 0, highestPrecision) });
					if (obstacle) return dispatch(addObstacle(obstacle));
					break;
				}
				case ObjectType.ARC: {
					const arc = handleCreateArc(ctx, notePlacementMode, grid);
					if (arc) return dispatch(addArc(arc));
					break;
				}
				case ObjectType.CHAIN: {
					const chain = handleCreateChain(ctx, notePlacementMode, grid);
					if (chain) return dispatch(addChain(chain));
					break;
				}
			}
		},
	});

	const handleGridPointerDown = (event: ThreeEvent<PointerEvent>) => {
		// ignore left click, since we don't want passthrough to take priority over placements
		if (event.button === 0) {
			event.stopPropagation();
		}
	};

	return (
		<PlacementGrid.Root onPointerDown={handleGridPointerDown} {...rest} service={service}>
			<PlacementGrid.Layout>{(cell) => <PlacementGrid.Cell key={`${cell.colIndex}-${cell.rowIndex}`} data={cell} layers={!selectionMode ? 1 : 0} />}</PlacementGrid.Layout>
			<Switch>
				<Match when={!selectionMode && activeType.current === ObjectType.NOTE}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => createColorNoteFromMouseEvent(ctx, mode, grid, { direction: Math.round(ctx.direction ?? selectedDirection) })}>
						{(data) => activeType.current && <ColorNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedColor === ObjectColor.LEFT ? ColorSchemeKey.SABER_LEFT : ColorSchemeKey.SABER_RIGHT, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && activeType.current === ObjectType.BOMB}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => createBombNoteFromMouseEvent(ctx, mode, grid)}>
						{(data) => activeType.current && <BombNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(activeType.current, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && activeType.current === ObjectType.OBSTACLE}>
					<PlacementGrid.TentativeObject mode={obstaclePlacementMode} createObject={(ctx, mode, grid) => createObstacleFromMouseEvent(ctx, mode, grid, { duration: Math.max(ctx.duration ?? 0, highestPrecision) })}>
						{(data) => activeType.current && <Obstacle data={data} beatDepth={beatDepth} position={resolvePositionForObstacle(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(activeType.current, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && activeType.current === ObjectType.ARC}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => handleCreateArc(ctx, mode, grid)}>
						{(data) => activeType.current && <Arc data={data} beatDepth={beatDepth} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(data.color === 0 ? ColorSchemeKey.SABER_LEFT : ColorSchemeKey.SABER_RIGHT, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && activeType.current === ObjectType.CHAIN}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => handleCreateChain(ctx, mode, grid)}>
						{(data) => activeType.current && <Chain data={data} beatDepth={beatDepth} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(data.color === 0 ? ColorSchemeKey.SABER_LEFT : ColorSchemeKey.SABER_RIGHT, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
			</Switch>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
