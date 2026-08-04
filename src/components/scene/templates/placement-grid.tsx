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
import { addBombNote, addColorNote, addObstacle } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectColorScheme, selectCursorPositionInBeats, selectDefaultObstacleDuration, selectGridSize, selectNotePlacementMode, selectNotesEditorDirection, selectNotesEditorSelectionMode, selectNotesEditorTool, selectObstaclePlacementMode, selectSnap } from "$/store/selectors";
import { ObjectTool } from "$/types";
import { roundToNearest } from "$/utils";

function EditorPlacementGrid({ onCellPointerDown, onCellWheel, ...rest }: Assign<ComponentProps<"group">, Pick<PlacementGrid.Schema["props"], "onCellPointerDown" | "onCellWheel">>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const snapTo = useAppSelector(selectSnap);
	const notePlacementMode = useAppSelector((state) => selectNotePlacementMode(state, sid));
	const obstaclePlacementMode = useAppSelector((state) => selectObstaclePlacementMode(state, sid));
	const grid = useAppSelector((state) => selectGridSize(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);
	const beatDepth = useAppSelector(selectBeatDepth);

	const service = useMachine(PlacementGrid.machine, {
		notePlacementMode,
		obstaclePlacementMode,
		grid,
		onCellPointerDown,
		onCellWheel,
		onPointerUp: (_, ctx) => {
			if (selectionMode) return;

			const time = roundToNearest(cursorPositionInBeats, snapTo);

			switch (selectedTool) {
				case ObjectTool.LEFT_NOTE:
				case ObjectTool.RIGHT_NOTE: {
					const note = createColorNoteFromMouseEvent(ctx, notePlacementMode, grid, { direction: Math.round(ctx.direction ?? selectedDirection) });
					if (note) return dispatch(addColorNote({ ...note, time }));
					break;
				}
				case ObjectTool.BOMB_NOTE: {
					const note = createBombNoteFromMouseEvent(ctx, notePlacementMode, grid);
					if (note) return dispatch(addBombNote({ ...note, time }));
					break;
				}
				case ObjectTool.OBSTACLE: {
					const obstacle = createObstacleFromMouseEvent(ctx, obstaclePlacementMode, grid, { duration: defaultObstacleDuration });
					if (obstacle) return dispatch(addObstacle({ ...obstacle, time }));
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
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => createColorNoteFromMouseEvent(ctx, mode, grid, { direction: Math.round(ctx.direction ?? selectedDirection) })}>
						{(data) => <ColorNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && selectedTool === ObjectTool.BOMB_NOTE}>
					<PlacementGrid.TentativeObject mode={notePlacementMode} createObject={(ctx, mode, grid) => createBombNoteFromMouseEvent(ctx, mode, grid)}>
						{(data) => <BombNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && selectedTool === ObjectTool.OBSTACLE}>
					<PlacementGrid.TentativeObject mode={obstaclePlacementMode} createObject={(ctx, mode, grid) => createObstacleFromMouseEvent(ctx, mode, grid, { duration: defaultObstacleDuration })}>
						{(data) => <Obstacle data={data} beatDepth={beatDepth} position={resolvePositionForObstacle(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
			</Switch>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
