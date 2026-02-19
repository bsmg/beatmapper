import type { ThreeEvent } from "@react-three/fiber";
import { useParams } from "@tanstack/react-router";
import { useCallback } from "react";

import { ColorNote, Obstacle } from "$/components/scene/compositions";
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
import { type App, ObjectTool } from "$/types";
import type { GroupProps } from "$/types/vendor";

interface Props extends GroupProps {
	interactive?: boolean;
	onCellPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
	onCellWheel?: (event: ThreeEvent<WheelEvent>) => void;
}
function EditorPlacementGrid({ interactive, onCellPointerDown, onCellWheel, ...rest }: Props) {
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

	const handlePointerUp = useCallback(
		(_: PointerEvent, { cellDownAt, cellOverAt, direction }: Pick<PlacementGrid.IPlacementGridContext, "cellDownAt" | "cellOverAt" | "direction">) => {
			if (!cellDownAt) return;
			if (selectionMode) return;

			switch (selectedTool) {
				case ObjectTool.LEFT_NOTE:
				case ObjectTool.RIGHT_NOTE: {
					const note = createColorNoteFromMouseEvent(mode, cellDownAt, grid, Math.round(direction ?? selectedDirection));
					dispatch(addToCell({ songId: sid, tool: selectedTool, posX: note.posX, posY: note.posY, direction: note.direction }));
					break;
				}
				case ObjectTool.BOMB_NOTE: {
					const note = createBombNoteFromMouseEvent(mode, cellDownAt, grid);
					dispatch(addToCell({ songId: sid, tool: selectedTool, posX: note.posX, posY: note.posY }));
					break;
				}
				case ObjectTool.OBSTACLE: {
					if (!cellOverAt) break;
					const obstacle = createObstacleFromMouseEvent(mode, cellDownAt, cellOverAt, grid);
					dispatch(addObstacle({ songId: sid, obstacle: { ...obstacle, duration: defaultObstacleDuration } }));
					break;
				}
			}
		},
		[dispatch, sid, selectionMode, mode, grid, selectedTool, selectedDirection, defaultObstacleDuration],
	);

	return (
		<PlacementGrid.Root {...rest} mode={mode} onCellPointerDown={onCellPointerDown} onCellPointerUp={handlePointerUp} onCellWheel={onCellWheel}>
			<PlacementGrid.Layout grid={grid}>{({ colIndex, rowIndex, grid }) => <PlacementGrid.Cell key={`${colIndex}-${rowIndex}`} layers={!selectionMode ? 1 : 2} colIndex={colIndex} rowIndex={rowIndex} grid={grid} />}</PlacementGrid.Layout>
			<Switch>
				<Match when={!selectionMode && (selectedTool === ObjectTool.LEFT_NOTE || selectedTool === ObjectTool.RIGHT_NOTE)}>
					<PlacementGrid.TentativeObject createObject={(ctx, { mode, grid }) => createColorNoteFromMouseEvent(mode, ctx.cellDownAt, grid, ctx.direction)}>
						{(data: App.IColorNote) => <ColorNote data={data} position={resolvePositionForGridObject(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(selectedTool, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
				<Match when={!selectionMode && selectedTool === ObjectTool.OBSTACLE}>
					<PlacementGrid.TentativeObject createObject={(ctx, { mode, grid }) => ({ ...createObstacleFromMouseEvent(mode, ctx.cellDownAt, ctx.cellOverAt, grid), duration: defaultObstacleDuration })}>
						{(data: App.IObstacle) => <Obstacle data={data} beatDepth={beatDepth} position={resolvePositionForObstacle(data, { beatDepth, zOffset: SONG_OFFSET })} color={resolveColorForItem(ObjectTool.OBSTACLE, { colorScheme })} />}
					</PlacementGrid.TentativeObject>
				</Match>
			</Switch>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
