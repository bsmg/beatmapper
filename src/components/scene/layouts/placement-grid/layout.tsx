import type { ReactNode } from "react";

import type { IGrid } from "$/types";
import { range } from "$/utils";

import type { CellProps } from "./cell";

interface Props {
	grid: IGrid;
	children: (cell: CellProps) => ReactNode;
}
function PlacementGridLayout({ grid, children, ...rest }: Props) {
	return range(grid.numRows).map((rowIndex) => {
		return range(grid.numCols).map((colIndex) => {
			return children({ ...rest, colIndex, rowIndex, grid });
		});
	});
}

export default PlacementGridLayout;
