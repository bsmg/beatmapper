import { useHotkeyStore } from "@ark-ui/react/hotkeys";
import type { ThreeEvent } from "@react-three/fiber";
import { useParams } from "@tanstack/react-router";
import { useMachine } from "@zag-js/react";
import { type ComponentProps, useRef } from "react";

import { BombNote, ColorNote, Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { resolvePositionForGridObject, resolvePositionForObstacle } from "$/components/scene/helpers";
import { PlacementGrid } from "$/components/scene/layouts";
import { Match, Switch } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { createBombNoteFromMouseEvent, createColorNoteFromMouseEvent } from "$/helpers/notes.helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { addBombNote, addColorNote, addObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCursorPositionInBeats, selectGridSize, selectHighestPrecision, selectNotePlacementMode, selectNotesEditorColor, selectNotesEditorDirection, selectNotesEditorSelectionMode, selectNotesEditorType, selectObstaclePlacementMode, selectTrackScale } from "$/store/selectors";
import { ColorSchemeKey, ObjectColor, ObjectType } from "$/types";

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
	const beatDepth = useAppSelector(selectTrackScale);
	const highestPrecision = useAppSelector(selectHighestPrecision);

	const hotkeys = useHotkeyStore();

	const activeType = useRef<ObjectType>(null);

	const service = useMachine(PlacementGrid.machine, {
		notePlacementMode,
		obstaclePlacementMode,
		grid,
		cursorPositionInBeats,
		selectedType,
		shouldLockCursor: (type) => type !== ObjectType.OBSTACLE,
		onCellPointerDown: (_, _ctx, { type }) => {
			if (selectionMode) return;

			if (type !== ObjectType.OBSTACLE) {
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
			</Switch>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
