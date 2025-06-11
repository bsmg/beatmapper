import type { GroupProps } from "@react-three/fiber";
import { useCallback } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { addObstacle, addToCell } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectDefaultObstacleDuration, selectGridSize, selectNotesEditorDirection, selectNotesEditorTool, selectPlacementMode } from "$/store/selectors";
import { type BeatmapId, ObjectTool, type SongId } from "$/types";

import { PlacementGrid } from "$/components/scene/layouts";
import { createBombNoteFromMouseEvent, createColorNoteFromMouseEvent } from "$/helpers/notes.helpers";

interface Props extends GroupProps {
	sid: SongId;
	bid: BeatmapId;
}
function EditorPlacementGrid({ sid, bid, ...rest }: Props) {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => selectPlacementMode(state, sid));
	const grid = useAppSelector((state) => selectGridSize(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);

	const handlePointerUp = useCallback(
		(_: PointerEvent, { cellDownAt, cellOverAt, direction }: Pick<PlacementGrid.IPlacementGridContext, "cellDownAt" | "cellOverAt" | "direction">) => {
			if (!cellDownAt) return;

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
		[dispatch, sid, mode, grid, selectedTool, selectedDirection, defaultObstacleDuration],
	);

	return (
		<PlacementGrid.Root {...rest} mode={mode} onCellPointerUp={handlePointerUp}>
			<PlacementGrid.Layout grid={grid}>{({ colIndex, rowIndex, grid }) => <PlacementGrid.Cell key={`${colIndex}-${rowIndex}`} colIndex={colIndex} rowIndex={rowIndex} grid={grid} />}</PlacementGrid.Layout>
			{(selectedTool === ObjectTool.LEFT_NOTE || selectedTool === ObjectTool.RIGHT_NOTE) && <PlacementGrid.TentativeNote grid={grid} mode={mode} color={resolveColorForItem(selectedTool, { customColors: colorScheme })} />}
			{selectedTool === ObjectTool.OBSTACLE && <PlacementGrid.TentativeObstacle grid={grid} mode={mode} color={resolveColorForItem(ObjectTool.OBSTACLE, { customColors: colorScheme })} />}
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
