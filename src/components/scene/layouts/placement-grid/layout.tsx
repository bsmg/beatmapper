import type { ReactNode } from "react";

import type { IGrid } from "$/types";
import { range } from "$/utils";

import type { CellProps } from "./cell";

interface Props {
	grid: IGrid;
	children: (cell: CellProps) => ReactNode;
}
function PlacementGridLayout({ grid, children, ...rest }: Props) {
	return Array.from(range(grid.numRows)).map((rowIndex) => {
		return Array.from(range(grid.numCols)).map((colIndex) => {
			return children({ ...rest, colIndex, rowIndex, grid });
		});
	});
}

export default PlacementGridLayout;
