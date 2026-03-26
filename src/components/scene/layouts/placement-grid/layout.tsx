import type { ReactNode } from "react";

import type { IGridCell } from "$/types";
import { range } from "$/utils";
import { usePlacementGridContext } from "./context";

interface Props {
	children: (cell: IGridCell) => ReactNode;
}
function PlacementGridLayout({ children }: Props) {
	const { grid } = usePlacementGridContext();

	return Array.from(range(grid.numRows)).map((rowIndex) => {
		return Array.from(range(grid.numCols)).map((colIndex) => {
			return children({ colIndex, rowIndex });
		});
	});
}

export default PlacementGridLayout;
