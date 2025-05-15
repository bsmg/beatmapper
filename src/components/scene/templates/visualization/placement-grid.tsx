import type { ThreeElements } from "@react-three/fiber";
import type { NoteDirection } from "bsmap";
import { useCallback, useRef, useState } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { convertGridColumn, convertGridRow } from "$/helpers/grid.helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { clickPlacementGrid, createNewObstacle, setBlockByDragging } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectDefaultObstacleDuration, selectGridSize, selectNoteEditorDirection, selectNoteEditorTool, selectPlacementMode } from "$/store/selectors";
import { type BeatmapId, ObjectTool, type SongId } from "$/types";

import { PlacementGrid, resolveNoteDirectionForPlacementMode } from "$/components/scene/layouts";

interface ITentativeBlock {
	direction: number;
	rowIndex: number;
	colIndex: number;
	selectedTool: ObjectTool;
}

type GroupProps = ThreeElements["group"];

interface Props extends GroupProps {
	sid: SongId;
	bid: BeatmapId;
}
function EditorPlacementGrid({ sid, bid, ...rest }: Props) {
	const dispatch = useAppDispatch();
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNoteEditorTool);
	const selectedDirection = useAppSelector(selectNoteEditorDirection);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);
	const mappingMode = useAppSelector((state) => selectPlacementMode(state, sid));

	const cachedDirection = useRef<NoteDirection | null>(null);
	const [tentativeBlock, setTentativeBlock] = useState<ITentativeBlock | null>(null);

	const handlePointerDown = useCallback(() => {
		// just in case the tentative block isn't flushed out from the last action, we'll make extra sure that's taken care of.
		if (tentativeBlock) setTentativeBlock(null);
	}, [tentativeBlock]);

	const handlePointerUp = useCallback(
		(event: PointerEvent, { mouseDownAt, mouseOverAt }: Pick<PlacementGrid.IPlacementGridContext, "mouseDownAt" | "mouseOverAt">) => {
			if (!mouseDownAt) return;
			// Only pay attention to left-clicks when it comes to the placement grid. Right-clicks should pass through.
			if (event.buttons !== 0) return;

			// With mapping extensions enabled, it's possible we need to convert the rowIndex/colIndex to one appropriate for the current grid!
			const effectiveColIndex = convertGridColumn(mouseDownAt.colIndex, numCols, colWidth);
			const effectiveRowIndex = convertGridRow(mouseDownAt.rowIndex, numRows, rowHeight);

			switch (selectedTool) {
				case ObjectTool.LEFT_NOTE:
				case ObjectTool.RIGHT_NOTE: {
					dispatch(setBlockByDragging({ songId: sid, tool: selectedTool, rowIndex: effectiveRowIndex, colIndex: effectiveColIndex, direction: (tentativeBlock?.direction ?? selectedDirection) as NoteDirection }));
					break;
				}
				case ObjectTool.BOMB_NOTE: {
					dispatch(clickPlacementGrid({ songId: sid, tool: selectedTool, rowIndex: effectiveRowIndex, colIndex: effectiveColIndex, direction: (tentativeBlock?.direction ?? selectedDirection) as NoteDirection }));
					break;
				}
				case ObjectTool.OBSTACLE: {
					if (!mouseDownAt || !mouseOverAt) break;
					const obstacle = createObstacleFromMouseEvent(mappingMode, numCols, numRows, colWidth, rowHeight, mouseDownAt, mouseOverAt, defaultObstacleDuration);
					dispatch(createNewObstacle({ songId: sid, obstacle }));
					break;
				}
			}
			setTentativeBlock(null);
			cachedDirection.current = null;
		},
		[dispatch, sid, numCols, numRows, colWidth, rowHeight, selectedTool, selectedDirection, tentativeBlock, mappingMode, defaultObstacleDuration],
	);

	const handlePointerMove = useCallback(
		(ev: PointerEvent, { mouseDownAt }: Pick<PlacementGrid.IPlacementGridContext, "mouseDownAt" | "mouseOverAt">) => {
			switch (selectedTool) {
				case ObjectTool.LEFT_NOTE:
				case ObjectTool.RIGHT_NOTE: {
					if (!mouseDownAt) return;
					const direction = resolveNoteDirectionForPlacementMode({ x: mouseDownAt.x, y: mouseDownAt.y }, { x: ev.pageX, y: ev.pageY }, mappingMode, ev.metaKey);

					// Mousemoves register very quickly; dozens of identical events might be submitted if we don't stop it, causing a backlog to accumulate on the main thread.
					if (direction === null || direction === cachedDirection.current) return;

					const effectiveColIndex = convertGridColumn(mouseDownAt.colIndex, numCols, colWidth);
					const effectiveRowIndex = convertGridRow(mouseDownAt.rowIndex, numRows, rowHeight);

					setTentativeBlock({
						direction: direction,
						rowIndex: effectiveRowIndex,
						colIndex: effectiveColIndex,
						selectedTool,
					});

					cachedDirection.current = direction as NoteDirection;

					break;
				}
				default: {
					break;
				}
			}
		},
		[numCols, numRows, colWidth, rowHeight, selectedTool, mappingMode],
	);

	return (
		<PlacementGrid.Root {...rest} numCols={numCols} numRows={numRows} colWidth={colWidth} rowHeight={rowHeight} onCellPointerDown={handlePointerDown} onCellPointerUp={handlePointerUp} onCellPointerMove={handlePointerMove}>
			<PlacementGrid.Layout numCols={numCols} numRows={numRows} colWidth={colWidth} rowHeight={rowHeight}>
				{({ ...cell }) => <PlacementGrid.Cell {...cell} key={`${cell.colIndex}-${cell.rowIndex}`} numCols={numCols} numRows={numRows} colWidth={colWidth} rowHeight={rowHeight} />}
			</PlacementGrid.Layout>
			<PlacementGrid.Consumer>{() => tentativeBlock && <PlacementGrid.TentativeNote direction={tentativeBlock.direction} color={resolveColorForItem(tentativeBlock.selectedTool, { customColors: colorScheme })} />}</PlacementGrid.Consumer>
			<PlacementGrid.Consumer>{() => selectedTool === ObjectTool.OBSTACLE && <PlacementGrid.TentativeObstacle sid={sid} color={resolveColorForItem(ObjectTool.OBSTACLE, { customColors: colorScheme })} />}</PlacementGrid.Consumer>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
