import { type ReactNode, useMemo } from "react";

import type { IGrid, ObjectPlacementMode } from "$/types";
import { usePlacementGridContext } from "./context";
import type { IPlacementContext } from "./machine";

interface Props<T> {
	createObject: (ctx: IPlacementContext, mode: ObjectPlacementMode, grid: IGrid) => T | null;
	children: (data: NonNullable<T>) => ReactNode;
}
function TentativeObject<T>({ createObject, children }: Props<T>) {
	const { mode, grid, mouseDownAt, cellDownAt, cellOverAt, direction } = usePlacementGridContext();

	const data = useMemo(() => {
		if (mouseDownAt?.button !== 0) return null;
		return { ...createObject({ cellDownAt, cellOverAt, direction }, mode, grid), tentative: true } as T;
	}, [createObject, mouseDownAt, cellDownAt, cellOverAt, direction, mode, grid]);

	if (!data) return null;

	return children(data);
}

export default TentativeObject;
