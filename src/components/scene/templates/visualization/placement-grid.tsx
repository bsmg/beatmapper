import type { ThreeElements } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";

import { getColorForItem } from "$/helpers/colors.helpers";
import { convertGridColumn, convertGridRow } from "$/helpers/grid.helpers";
import { createObstacleFromMouseEvent } from "$/helpers/obstacles.helpers";
import { clickPlacementGrid, createNewObstacle, setBlockByDragging } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectDefaultObstacleDuration, selectGridSize, selectNoteEditorDirection, selectNoteEditorTool, selectPlacementMode } from "$/store/selectors";
import { type CutDirection, ObjectTool, type SongId } from "$/types";

import { PlacementGrid, resolveNoteDirectionForPlacementMode } from "$/components/scene/layouts";

interface ITentativeBlock {
	direction: CutDirection;
	rowIndex: number;
	colIndex: number;
	selectedTool: ObjectTool;
}

type GroupProps = ThreeElements["group"];

interface Props extends GroupProps {
	sid: SongId;
}
function EditorPlacementGrid({ sid, ...rest }: Props) {
	const dispatch = useAppDispatch();
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, sid));
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const selectedTool = useAppSelector(selectNoteEditorTool);
	const selectedDirection = useAppSelector(selectNoteEditorDirection);
	const defaultObstacleDuration = useAppSelector(selectDefaultObstacleDuration);
	const mappingMode = useAppSelector((state) => selectPlacementMode(state, sid));

	const cachedDirection = useRef<CutDirection | null>(null);
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
					dispatch(setBlockByDragging({ tool: selectedTool, rowIndex: effectiveRowIndex, colIndex: effectiveColIndex, direction: tentativeBlock?.direction ?? selectedDirection }));
					break;
				}
				case ObjectTool.BOMB_NOTE: {
					dispatch(clickPlacementGrid({ tool: selectedTool, rowIndex: effectiveRowIndex, colIndex: effectiveColIndex, direction: tentativeBlock?.direction ?? selectedDirection }));
					break;
				}
				case ObjectTool.OBSTACLE: {
					if (!mouseDownAt || !mouseOverAt) break;
					const obstacle = createObstacleFromMouseEvent(mappingMode, numCols, numRows, colWidth, rowHeight, mouseDownAt, mouseOverAt, defaultObstacleDuration);
					dispatch(createNewObstacle({ obstacle }));
					break;
				}
			}
			setTentativeBlock(null);
			cachedDirection.current = null;
		},
		[dispatch, numCols, numRows, colWidth, rowHeight, selectedTool, selectedDirection, tentativeBlock, mappingMode, defaultObstacleDuration],
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

					cachedDirection.current = direction;

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
			<PlacementGrid.Consumer>{() => tentativeBlock && <PlacementGrid.TentativeNote direction={tentativeBlock.direction} color={getColorForItem(tentativeBlock.selectedTool, customColors)} />}</PlacementGrid.Consumer>
			<PlacementGrid.Consumer>{() => selectedTool === ObjectTool.OBSTACLE && <PlacementGrid.TentativeObstacle sid={sid} color={getColorForItem(ObjectTool.OBSTACLE, customColors)} />}</PlacementGrid.Consumer>
		</PlacementGrid.Root>
	);
}

export default EditorPlacementGrid;
