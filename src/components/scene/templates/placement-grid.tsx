import type { Assign } from "@ark-ui/react";
import { useHotkeyStore } from "@ark-ui/react/hotkeys";
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
import { selectColorScheme, selectCursorPositionInBeats, selectGridSize, selectNotePlacementMode, selectNotesEditorDirection, selectNotesEditorSelectionMode, selectNotesEditorTool, selectObstaclePlacementMode, selectTrackScale } from "$/store/selectors";
import { ObjectTool } from "$/types";

function EditorPlacementGrid({ onCellPointerDown, onCellWheel, ...rest }: Assign<ComponentProps<"group">, Pick<PlacementGrid.Schema["props"], "onCellPointerDown" | "onCellWheel">>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const notePlacementMode = useAppSelector((state) => selectNotePlacementMode(state, sid));
	const obstaclePlacementMode = useAppSelector((state) => selectObstaclePlacementMode(state, sid));
	const grid = useAppSelector((state) => selectGridSize(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const beatDepth = useAppSelector(selectTrackScale);

	const hotkeys = useHotkeyStore();

	const activeTool = useRef<ObjectTool>(null);

	const service = useMachine(PlacementGrid.machine, {
		notePlacementMode,
		obstaclePlacementMode,
		grid,
		cursorPositionInBeats,
		selectedTool,
		shouldLockCursor: (tool) => tool !== ObjectTool.OBSTACLE,
		onCellPointerDown: (ev, ctx, { tool }) => {
			if (selectionMode) return;

			if (tool !== ObjectTool.OBSTACLE) {
				hotkeys.removeScope("navigation");
			}

			activeTool.current = tool;

			return onCellPointerDown?.(ev, ctx, { tool });
		},
		onPointerUp: (_, ctx, { tool }) => {
			if (selectionMode) return;

			if (!hotkeys.getActiveScopes().includes("navigation")) {
				hotkeys.addScope("navigation");
			}

			switch (tool) {
				case ObjectTool.LEFT_NOTE:
				case ObjectTool.RIGHT_NOTE: {
					const note = createColorNoteFromMouseEvent(ctx, notePlacementMode, grid, {
						color: Object.values(ObjectTool).indexOf(tool) as 0 | 1,
						direction: Math.round(ctx.direction ?? selectedDirection),
					});
					if (note) return dispatch(addColorNote(note));
					break;
				}
				case ObjectTool.BOMB_NOTE: {
					const note = createBombNoteFromMouseEvent(ctx, notePlacementMode, grid);
					if (note) return dispatch(addBombNote(note));
					break;
				}
				case ObjectTool.OBSTACLE: {
					const obstacle = createObstacleFromMouseEvent(ctx, obstaclePlacementMode, grid);
					if (obstacle) return dispatch(addObstacle(obstacle));
					break;
				}
			}
		},
		onCellWheel,
	});

	return (
		<PlacementGrid.Root {...rest} service={service}>
			<PlacementGrid.Layout>{(cell) => <PlacementGrid.Cell key={`${cell.colIndex}-${cell.rowIndex}`} data={cell} layers={!selectionMode ? 1 : 2} />}</PlacementGrid.Layout>
			<Switch>
				<Match when={!selectionMode && (activeTool.current === ObjectTool.LEFT_NOTE || activeTool.current === ObjectTool.RIGHT_NOTE)}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => createColorNoteFromMouseEvent(ctx, mode, grid, { direction: Math.round(ctx.direction ?? selectedDirection) })}>
						{(data) => activeTool.current && <ColorNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(activeTool.current, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && activeTool.current === ObjectTool.BOMB_NOTE}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => createBombNoteFromMouseEvent(ctx, mode, grid)}>
						{(data) => activeTool.current && <BombNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(activeTool.current, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && activeTool.current === ObjectTool.OBSTACLE}>
					<PlacementGrid.TentativeObject mode={obstaclePlacementMode} createObject={(ctx, mode, grid) => createObstacleFromMouseEvent(ctx, mode, grid)}>
						{(data) => activeTool.current && <Obstacle data={data} beatDepth={beatDepth} position={resolvePositionForObstacle(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(activeTool.current, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
			</Switch>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
