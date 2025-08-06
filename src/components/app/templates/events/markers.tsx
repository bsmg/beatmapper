import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectEventsEditorBeatsPerZoomLevel } from "$/store/selectors";
import { range } from "$/utils";
import { token } from "$:styled-system/tokens";

interface Props {
	width: number;
	height: number;
	primaryDivisions: number;
}
function EventGridMarkers({ width, height, primaryDivisions }: Props) {
	const numOfBeatsToShow = useAppSelector(selectEventsEditorBeatsPerZoomLevel);

	const segmentWidth = useMemo(() => width / numOfBeatsToShow, [width, numOfBeatsToShow]);

	const beatLines = useMemo(() => {
		return Array.from(range(numOfBeatsToShow)).map((i) => {
			// No line necessary for the right edge of the grid
			if (i === numOfBeatsToShow - 1) return null;
			return <line key={i} x1={(i + 1) * segmentWidth} y1={-6} x2={(i + 1) * segmentWidth} y2={height} stroke={token.var("colors.border.default")} strokeWidth={1} />;
		});
	}, [numOfBeatsToShow, height, segmentWidth]);

	const primaryLines = useMemo(() => {
		return beatLines.map((_, segmentIndex) => {
			return Array.from(range(primaryDivisions)).map((i) => {
				if (i === 0) return null;
				const subSegmentWidth = segmentWidth / primaryDivisions;
				return <line key={i} x1={segmentIndex * segmentWidth + i * subSegmentWidth} y1={0} x2={segmentIndex * segmentWidth + i * subSegmentWidth} y2={height} stroke={token.var("colors.border.subtle")} strokeWidth={1} />;
			});
		});
	}, [beatLines, primaryDivisions, height, segmentWidth]);

	return (
		<svg role="presentation" width={width} height={height}>
			{beatLines}
			{primaryLines}
		</svg>
	);
}

export default EventGridMarkers;
