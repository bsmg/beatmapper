import { Fragment, useEffect, useRef, useState } from "react";
import type { Vector3Tuple } from "three";

import { BLOCK_PLACEMENT_SQUARE_SIZE } from "$/constants";
import { getColorForItem } from "$/helpers/colors.helpers";
import { convertGridColumn, convertGridRow } from "$/helpers/grid.helpers";
import { clearCellOfNotes, clickPlacementGrid, createNewObstacle, setBlockByDragging } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getDefaultObstacleDuration, getNoteSelectionMode, getSelectedNoteTool, selectActiveSongId, selectCustomColors, selectGridSize, selectPlacementMode } from "$/store/selectors";
import { type CutDirection, ObjectTool } from "$/types";
import { range } from "$/utils";
import { getDirectionForDrag } from "./PlacementGrid.helpers";

import GridCell from "./GridCell";
import TentativeBlock from "./TentativeBlock";
import TentativeObstacle from "./TentativeObstacle";

interface ITentativeBlock {
	direction: CutDirection;
	rowIndex: number;
	colIndex: number;
	selectedTool: ObjectTool;
}

interface Props {
	width: number;
	height: number;
	gridPosition: Vector3Tuple;
}

const PlacementGrid = ({ gridPosition }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, songId));
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const selectedTool = useAppSelector(getSelectedNoteTool);
	const selectionMode = useAppSelector(getNoteSelectionMode);
	const mappingMode = useAppSelector((state) => selectPlacementMode(state, songId));
	const defaultObstacleDuration = useAppSelector(getDefaultObstacleDuration);
	const dispatch = useAppDispatch();

	const renderColWidth = colWidth * BLOCK_PLACEMENT_SQUARE_SIZE;
	const renderRowHeight = rowHeight * BLOCK_PLACEMENT_SQUARE_SIZE;

	const [mouseDownAt, setMouseDownAt] = useState<{ rowIndex: number; colIndex: number; x: number; y: number } | null>(null);
	const [mouseOverAt, setMouseOverAt] = useState<{ rowIndex: number; colIndex: number; x?: number; y?: number } | null>(null);
	const cachedDirection = useRef<CutDirection | null>(null);

	// `hoveredCell` is an indication of which square is currently highlighted by the cursor. You might think I could just use `mouseOverAt`, but there are 2 reasons why I can't:
	// - When clicking and dragging to place a cell, I want to 'lock' hoveredCell, even though I'm still mousing over other cells
	// - A weird bug (maybe?) means that mouseOver events can fire BEFORE mouseOut events (on the cell being leaved). So I get buggy flickering if I don't use this derived value.
	const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; colIndex: number; x?: number; y?: number } | null>(null);

	const [tentativeBlock, setTentativeBlock] = useState<ITentativeBlock | null>(null);

	useEffect(() => {
		// HACK: I'm having closure issues, so in addition to the `tentativeBlock` in state that is rendered for the user, I'm duplicating that data within this effect under `evenMoreTentativeBlock`.
		// This is hacky and a bad idea, but it works and I'm lazy.
		let evenMoreTentativeBlock: ITentativeBlock;

		const handleMouseMove = (ev: MouseEvent) => {
			if (!mouseDownAt) return;
			const { rowIndex, colIndex, ...initialPosition } = mouseDownAt;

			if (selectedTool !== ObjectTool.LEFT_NOTE && selectedTool !== ObjectTool.RIGHT_NOTE) {
				return;
			}

			const currentPosition = {
				x: ev.pageX,
				y: ev.pageY,
			};

			const direction = getDirectionForDrag(initialPosition, currentPosition, mappingMode, ev.metaKey);

			if (typeof direction === "number" && direction !== cachedDirection.current) {
				// Mousemoves register very quickly; dozens of identical events might be submitted if we don't stop it, causing a backlog to accumulate on the main thread.
				if (cachedDirection.current === direction) {
					return;
				}

				const effectiveColIndex = convertGridColumn(colIndex, numCols, colWidth);
				const effectiveRowIndex = convertGridRow(rowIndex, numRows, rowHeight);

				// If this is the first move event that creates this tentative block, delete any pre-existing block in this cell
				dispatch(clearCellOfNotes({ rowIndex: effectiveRowIndex, colIndex: effectiveColIndex, tool: selectedTool }));

				evenMoreTentativeBlock = {
					direction,
					rowIndex: effectiveRowIndex,
					colIndex: effectiveColIndex,
					selectedTool,
				};

				setTentativeBlock(evenMoreTentativeBlock);

				cachedDirection.current = direction;
			}
		};

		const handleMouseUp = (_ev: MouseEvent) => {
			window.requestAnimationFrame(() => {
				if (evenMoreTentativeBlock) {
					dispatch(setBlockByDragging({ direction: evenMoreTentativeBlock.direction, rowIndex: evenMoreTentativeBlock.rowIndex, colIndex: evenMoreTentativeBlock.colIndex, tool: evenMoreTentativeBlock.selectedTool }));
					setTentativeBlock(null);
				}
				setMouseDownAt(null);
				setMouseOverAt(null);
				setHoveredCell(null);
				cachedDirection.current = null;
			});
		};

		if (mouseDownAt) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [mouseDownAt, selectedTool, numCols, numRows, colWidth, rowHeight, mappingMode, dispatch]);

	return (
		<Fragment>
			{range(numRows).map((rowIndex) =>
				range(numCols).map((colIndex) => {
					const isHovered = !!(hoveredCell && hoveredCell.rowIndex === rowIndex && hoveredCell.colIndex === colIndex);

					return (
						<GridCell
							key={`${rowIndex}-${colIndex}`}
							rowIndex={rowIndex}
							colIndex={colIndex}
							numRows={numRows}
							numCols={numCols}
							rowHeight={rowHeight}
							colWidth={colWidth}
							renderRowHeight={renderRowHeight}
							renderColWidth={renderColWidth}
							isHovered={isHovered}
							gridPosition={gridPosition}
							selectedTool={selectedTool}
							mouseDownAt={mouseDownAt}
							setMouseDownAt={setMouseDownAt}
							setMouseOverAt={setMouseOverAt}
							mappingMode={mappingMode}
							defaultObstacleDuration={defaultObstacleDuration}
							selectionMode={selectionMode}
							setHoveredCell={setHoveredCell}
							clickPlacementGrid={(rowIndex, colIndex) => dispatch(clickPlacementGrid({ rowIndex, colIndex, tool: selectedTool }))}
							createNewObstacle={(obstacle) => dispatch(createNewObstacle({ obstacle }))}
						/>
					);
				}),
			)}

			{tentativeBlock && <TentativeBlock direction={tentativeBlock.direction} rowIndex={tentativeBlock.rowIndex} colIndex={tentativeBlock.colIndex} color={getColorForItem(tentativeBlock.selectedTool, customColors)} />}

			{mouseDownAt && selectedTool === ObjectTool.OBSTACLE && <TentativeObstacle mouseDownAt={mouseDownAt} mouseOverAt={mouseOverAt} color={getColorForItem(ObjectTool.OBSTACLE, customColors)} mode={mappingMode} />}
		</Fragment>
	);
};

export default PlacementGrid;
