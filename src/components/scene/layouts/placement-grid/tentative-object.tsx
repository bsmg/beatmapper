import { useParams } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";

import { useUpdateEffect } from "$/components/hooks/use-update-effect";
import { useAppSelector } from "$/store/hooks";
import { selectCursorPositionInBeats } from "$/store/selectors";
import type { IGrid, NotePlacementMode, ObstaclePlacementMode } from "$/types";
import { usePlacementGridContext } from "./context";
import type { IPlacementContext } from "./machine";

interface Props<T, TMode extends NotePlacementMode | ObstaclePlacementMode> {
	mode: TMode;
	createObject: (ctx: IPlacementContext, mode: TMode, grid: IGrid) => T | null;
	children: (data: NonNullable<T>) => ReactNode;
}
function TentativeObject<T, TMode extends NotePlacementMode | ObstaclePlacementMode>({ mode, createObject, children }: Props<T, TMode>) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { grid, mouseDownAt, cellDownAt, cellOverAt, direction, anchorBeat, time, duration, updateAnchoredValues } = usePlacementGridContext();

	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));

	useUpdateEffect(updateAnchoredValues, [cursorPositionInBeats]);

	const data = useMemo(() => {
		if (mouseDownAt?.button !== 0) return null;
		const isAhead = (anchorBeat ?? 0) <= (time ?? 0);
		const tentativeTime = duration !== null && isAhead ? 0 - duration : (time ?? 0) - cursorPositionInBeats;
		return { ...createObject({ cellDownAt, cellOverAt, direction, time: tentativeTime, duration }, mode, grid), tentative: true } as T;
	}, [createObject, mouseDownAt, cellDownAt, cellOverAt, direction, cursorPositionInBeats, anchorBeat, time, duration, mode, grid]);

	if (!data) return null;

	return children(data);
}

export default TentativeObject;
