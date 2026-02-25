import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { useMachine } from "@zag-js/react";
import type { ComponentProps } from "react";

import { BombNote, ColorNote, Obstacle } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { resolvePositionForGridObject, resolvePositionForObstacle } from "$/components/scene/helpers";
import { PlacementGrid } from "$/components/scene/layouts";
import { Match, Switch } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { createBombNoteFromMouseEvent, createColorNoteFromMouseEvent } from "$/helpers/notes.helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { addObstacle, addToCell } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectColorScheme, selectDefaultObstacleDuration, selectGridSize, selectNotesEditorDirection, selectNotesEditorSelectionMode, selectNotesEditorTool, selectPlacementMode } from "$/store/selectors";
import { ObjectTool } from "$/types";

function EditorPlacementGrid({ onCellPointerDown, onCellWheel, ...rest }: Assign<ComponentProps<"group">, Pick<PlacementGrid.Schema["props"], "onCellPointerDown" | "onCellWheel">>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const mode = useAppSelector((state) => selectPlacementMode(state, sid));
	const grid = useAppSelector((state) => selectGridSize(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);
	const beatDepth = useAppSelector(selectBeatDepth);

	const service = useMachine(PlacementGrid.machine, {
		mode,
		grid,
		onCellPointerDown,
		onCellWheel,
		onPointerUp: (_, ctx) => {
			if (selectionMode) return;

			switch (selectedTool) {
				case ObjectTool.LEFT_NOTE:
				case ObjectTool.RIGHT_NOTE: {
					const note = createColorNoteFromMouseEvent(ctx, mode, grid, { direction: Math.round(ctx.direction ?? selectedDirection) });
					if (note) return dispatch(addToCell({ songId: sid, tool: selectedTool, posX: note.posX, posY: note.posY, direction: note.direction }));
					break;
				}
				case ObjectTool.BOMB_NOTE: {
					const note = createBombNoteFromMouseEvent(ctx, mode, grid);
					if (note) return dispatch(addToCell({ songId: sid, tool: selectedTool, posX: note.posX, posY: note.posY }));
					break;
				}
				case ObjectTool.OBSTACLE: {
					const obstacle = createObstacleFromMouseEvent(ctx, mode, grid, { duration: defaultObstacleDuration });
					if (obstacle) return dispatch(addObstacle({ songId: sid, obstacle }));
					break;
				}
			}
		},
	});

	return (
		<PlacementGrid.Root {...rest} service={service}>
			<PlacementGrid.Layout>{(cell) => <PlacementGrid.Cell key={`${cell.colIndex}-${cell.rowIndex}`} data={cell} layers={!selectionMode ? 1 : 2} />}</PlacementGrid.Layout>
			<Switch>
				<Match when={!selectionMode && (selectedTool === ObjectTool.LEFT_NOTE || selectedTool === ObjectTool.RIGHT_NOTE)}>
					<PlacementGrid.TentativeObject createObject={(ctx, mode, grid) => createColorNoteFromMouseEvent(ctx, mode, grid, { direction: ctx.direction ?? selectedDirection })}>
						{(data) => <ColorNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && selectedTool === ObjectTool.BOMB_NOTE}>
					<PlacementGrid.TentativeObject createObject={(ctx, mode, grid) => createBombNoteFromMouseEvent(ctx, mode, grid)}>
						{(data) => <BombNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && selectedTool === ObjectTool.OBSTACLE}>
					<PlacementGrid.TentativeObject createObject={(ctx, mode, grid) => createObstacleFromMouseEvent(ctx, mode, grid, { duration: defaultObstacleDuration })}>
						{(data) => <Obstacle data={data} beatDepth={beatDepth} position={resolvePositionForObstacle(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
			</Switch>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
