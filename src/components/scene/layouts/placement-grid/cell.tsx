import type { ThreeElements, ThreeEvent } from "@react-three/fiber";
import { memo, useCallback, useContext, useMemo } from "react";
import { DoubleSide } from "three";

import { BLOCK_PLACEMENT_SQUARE_SIZE } from "$/components/scene/constants";
import { Context } from "./context";

const CELL_PADDING = 0.05;
const VERTICAL_OFFSET = -BLOCK_PLACEMENT_SQUARE_SIZE;

type MeshProps = ThreeElements["mesh"];

export interface CellProps extends MeshProps {
	rowIndex: number;
	colIndex: number;
	numRows: number;
	numCols: number;
	rowHeight: number;
	colWidth: number;
}
function PlacementGridCell({ rowIndex, colIndex, numCols, rowHeight, colWidth, ...rest }: CellProps) {
	const { hoveredCell, onCellPointerDown, onCellPointerOut, onCellPointerOver, ...context } = useContext(Context);
	const isHovered = useMemo(() => !!(hoveredCell && hoveredCell.rowIndex === rowIndex && hoveredCell.colIndex === colIndex), [hoveredCell, colIndex, rowIndex]);

	// Our `rowHeight` is in units compared to the default, so a non-map-extension grid would have a height and width of 1. A rowHeight of 2 means it's 2x as big as that default.
	// `renderRowHeight` is how tall our grid cell should be in terms of rendering height.
	const renderRowHeight = useMemo(() => rowHeight * BLOCK_PLACEMENT_SQUARE_SIZE, [rowHeight]);
	const renderColWidth = useMemo(() => colWidth * BLOCK_PLACEMENT_SQUARE_SIZE, [colWidth]);

	// Because we want grids to be centered, the wider the grid, the more each position is pushed further from this position.
	// After sketching out the math, the formula looks like:
	// x = -0.5T + 0.5 + I       // T = Total Columns
	//                           // I = Column Index
	const x = useMemo(() => (numCols * -0.5 + 0.5 + colIndex) * renderColWidth, [numCols, colIndex, renderColWidth]);
	const y = useMemo(() => rowIndex * renderRowHeight + VERTICAL_OFFSET, [rowIndex, renderRowHeight]);

	const handlePointerDown = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onCellPointerDown) onCellPointerDown(ev.nativeEvent, { mouseDownAt: { rowIndex, colIndex, x: ev.pageX, y: ev.pageY } });
		},
		[colIndex, rowIndex, onCellPointerDown],
	);

	const handlePointerOver = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onCellPointerOver) onCellPointerOver(ev.nativeEvent, { mouseDownAt: context.mouseDownAt, mouseOverAt: { rowIndex, colIndex } });
		},
		[context.mouseDownAt, colIndex, rowIndex, onCellPointerOver],
	);

	const handlePointerOut = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onCellPointerOut) onCellPointerOut(ev.nativeEvent, { mouseOverAt: { rowIndex, colIndex } });
		},
		[colIndex, rowIndex, onCellPointerOut],
	);

	return (
		<mesh {...rest} key={`${rowIndex}-${colIndex}`} position-x={x} position-y={y} onPointerDown={handlePointerDown} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
			<planeGeometry attach="geometry" args={[renderColWidth - CELL_PADDING, renderRowHeight - CELL_PADDING, 1, 1]} />
			<meshBasicMaterial attach="material" color={0xffffff} transparent={true} opacity={isHovered ? 0.2 : 0.1} side={DoubleSide} />
		</mesh>
	);
}

export default memo(PlacementGridCell);
