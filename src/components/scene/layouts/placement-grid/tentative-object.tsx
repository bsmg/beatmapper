import { useParams } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectGridSize, selectPlacementMode } from "$/store/selectors";
import type { IGrid, ObjectPlacementMode } from "$/types";
import { usePlacementGridContext } from "./context";

interface Props<T> {
	createObject: (ctx: { cellDownAt: { rowIndex: number; colIndex: number }; cellOverAt: { rowIndex: number; colIndex: number }; direction: number }, state: { mode: ObjectPlacementMode; grid: IGrid }) => T;
	children: (data: T) => ReactNode;
}
function TentativeObject<T>({ createObject, children }: Props<T>) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const ctx = usePlacementGridContext();

	const mode = useAppSelector((state) => selectPlacementMode(state, sid));
	const grid = useAppSelector((state) => selectGridSize(state, sid));

	const data = useMemo(() => {
		if (!ctx.cellDownAt || !ctx.cellOverAt || ctx.direction === null) return null;
		return { ...createObject({ cellDownAt: ctx.cellDownAt, cellOverAt: ctx.cellOverAt, direction: ctx.direction }, { mode, grid }), tentative: true };
	}, [createObject, ctx.cellDownAt, ctx.cellOverAt, ctx.direction, mode, grid]);

	if (!data) return null;

	return children(data);
}

export default TentativeObject;
