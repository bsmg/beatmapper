import { type ReactNode, useMemo } from "react";

import type { IGrid, NotePlacementMode, ObstaclePlacementMode } from "$/types";
import { usePlacementGridContext } from "./context";
import type { IPlacementContext } from "./machine";

interface Props<T, TMode extends NotePlacementMode | ObstaclePlacementMode> {
	mode: TMode;
	createObject: (ctx: IPlacementContext, mode: TMode, grid: IGrid) => T | null;
	children: (data: NonNullable<T>) => ReactNode;
}
function TentativeObject<T, TMode extends NotePlacementMode | ObstaclePlacementMode>({ mode, createObject, children }: Props<T, TMode>) {
	const { grid, mouseDownAt, cellDownAt, cellOverAt, direction } = usePlacementGridContext();

	const data = useMemo(() => {
		if (mouseDownAt?.button !== 0) return null;
		return { ...createObject({ cellDownAt, cellOverAt, direction }, mode, grid), tentative: true } as T;
	}, [createObject, mouseDownAt, cellDownAt, cellOverAt, direction, mode, grid]);

	if (!data) return null;

	return children(data);
}

export default TentativeObject;
