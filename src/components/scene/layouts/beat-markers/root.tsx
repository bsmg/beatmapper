import { type ReactNode, useMemo } from "react";

import { useVisualizationContext } from "$/components/scene/layouts/visualization";
import { useAppSelector } from "$/store/hooks";
import { selectHighestPrecision } from "$/store/selectors";

interface Props {
	marks: number[];
	children: (beatNum: number, ctx: { isBeat: boolean }) => ReactNode;
}
function BeatMarkersRoot({ marks, children }: Props) {
	const { cursorPosition, beatDepth, surfaceDepth } = useVisualizationContext();

	const highestPrecision = useAppSelector(selectHighestPrecision);
	const numToRender = useMemo(() => surfaceDepth / beatDepth, [surfaceDepth, beatDepth]);

	const visibleMarkers = useMemo(() => {
		const start = cursorPosition;
		const end = cursorPosition + numToRender + highestPrecision;
		return marks.filter((beat) => beat >= start && beat < end);
	}, [marks, cursorPosition, numToRender, highestPrecision]);

	return visibleMarkers.map((beat) => children(beat, { isBeat: Number.isInteger(beat) }));
}

export default BeatMarkersRoot;
