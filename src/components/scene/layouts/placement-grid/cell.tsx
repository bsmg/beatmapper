import type { Assign } from "@ark-ui/react";
import { type ComponentProps, memo } from "react";
import { DoubleSide } from "three";

import { getComputedToken } from "$/styles/helpers";
import type { IGridCell } from "$/types";
import { usePlacementGridContext } from "./context";

const CELL_PADDING = 0.05;

interface Props {
	data: IGridCell;
}
function PlacementGridCell({ data: cell, ...rest }: Assign<ComponentProps<"mesh">, Props>) {
	const { grid, isCellHovered, getCellProps, scaleIndex } = usePlacementGridContext();

	return (
		<mesh {...getCellProps(cell)} {...rest}>
			<planeGeometry attach="geometry" args={[scaleIndex(grid.colWidth) - CELL_PADDING, scaleIndex(grid.rowHeight) - CELL_PADDING, 1, 1]} />
			<meshBasicMaterial attach="material" color={getComputedToken("colors.fg.contrast")} transparent={true} opacity={isCellHovered(cell) ? 0.2 : 0.1} side={DoubleSide} />
		</mesh>
	);
}

export default memo(PlacementGridCell);
