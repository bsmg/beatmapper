import { useParams } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";

import { FUDGE_FACTOR } from "$/components/scene/constants";
import { useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectCursorPositionInBeats, selectSurfaceDepth } from "$/store/selectors";

interface Props {
	marks: number[];
	children: (beatNum: number, ctx: { isBeat: boolean }) => ReactNode;
}
function BeatMarkersRoot({ marks, children }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const beatDepth = useAppSelector(selectBeatDepth);
	const surfaceDepth = useAppSelector(selectSurfaceDepth);

	const numToRender = useMemo(() => surfaceDepth / beatDepth, [surfaceDepth, beatDepth]);

	const visibleMarkers = useMemo(() => {
		const start = (cursorPositionInBeats ?? 0) - FUDGE_FACTOR;
		const end = (cursorPositionInBeats ?? 0) + numToRender + FUDGE_FACTOR;
		return marks.filter((beat) => beat >= start && beat < end);
	}, [marks, cursorPositionInBeats, numToRender]);

	return visibleMarkers.map((beat) => children(beat, { isBeat: Number.isInteger(beat) }));
}

export default BeatMarkersRoot;
