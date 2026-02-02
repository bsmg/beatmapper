import { Fragment, useCallback, useMemo } from "react";

import { For } from "$/components/ui/atoms";
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

	const renderBeatLine = useCallback(
		(beat: number) => {
			// No line necessary for the right edge of the grid
			if (beat === numOfBeatsToShow - 1) return null;
			return <line key={beat} x1={(beat + 1) * segmentWidth} y1={-6} x2={(beat + 1) * segmentWidth} y2={height} stroke={token.var("colors.border.default")} strokeWidth={1} />;
		},
		[numOfBeatsToShow, height, segmentWidth],
	);

	const renderPrimaryLine = useCallback(
		(beat: number, segmentIndex: number) => {
			if (beat === 0) return null;
			const subSegmentWidth = segmentWidth / primaryDivisions;
			return <line key={beat} x1={segmentIndex * segmentWidth + beat * subSegmentWidth} y1={0} x2={segmentIndex * segmentWidth + beat * subSegmentWidth} y2={height} stroke={token.var("colors.border.subtle")} strokeWidth={1} />;
		},
		[primaryDivisions, height, segmentWidth],
	);

	return (
		<svg role="presentation" width={width} height={height}>
			<For each={Array.from(range(numOfBeatsToShow))}>
				{(beat, index) => (
					<Fragment key={beat}>
						{renderBeatLine(beat)}
						<For each={Array.from(range(primaryDivisions))}>{(n) => renderPrimaryLine(n, index)}</For>
					</Fragment>
				)}
			</For>
		</svg>
	);
}

export default EventGridMarkers;
