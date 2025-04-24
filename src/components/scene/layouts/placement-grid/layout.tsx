import type { ReactNode } from "react";

import type { IGrid } from "$/types";
import { range } from "$/utils";

import type { CellProps } from "./cell";

interface Props extends IGrid {
	children: (cell: CellProps) => ReactNode;
}
function PlacementGridLayout({ numRows, numCols, colWidth, rowHeight, children, ...rest }: Props) {
	return range(numRows).map((rowIndex) => {
		return range(numCols).map((colIndex) => {
			return children({ ...rest, colIndex, rowIndex, numCols, numRows, colWidth, rowHeight });
		});
	});
}

export default PlacementGridLayout;
