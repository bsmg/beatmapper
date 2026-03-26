import { type ReactNode, useMemo } from "react";

import { FUDGE_FACTOR } from "$/components/scene/constants";
import { useVisualizationContext } from "$/components/scene/layouts/visualization";

interface Props {
	marks: number[];
	children: (beatNum: number, ctx: { isBeat: boolean }) => ReactNode;
}
function BeatMarkersRoot({ marks, children }: Props) {
	const { cursorPosition, beatDepth, surfaceDepth } = useVisualizationContext();

	const numToRender = useMemo(() => surfaceDepth / beatDepth, [surfaceDepth, beatDepth]);

	const visibleMarkers = useMemo(() => {
		const start = (cursorPosition ?? 0) - FUDGE_FACTOR;
		const end = (cursorPosition ?? 0) + numToRender + FUDGE_FACTOR;
		return marks.filter((beat) => beat >= start && beat < end);
	}, [marks, cursorPosition, numToRender]);

	return visibleMarkers.map((beat) => children(beat, { isBeat: Number.isInteger(beat) }));
}

export default BeatMarkersRoot;
