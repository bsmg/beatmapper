import { Fragment, useCallback, useMemo } from "react";

import { For } from "$/components/ui/atoms";
import { range } from "$/utils";
import { styled } from "$:styled-system/jsx";
import { token } from "$:styled-system/tokens";
import { useEventGridContext } from "./context";

function EventGridMarkers() {
	const { snapDivision, numOfBeatsToShow, dimensions } = useEventGridContext();

	const segmentWidth = useMemo(() => dimensions.width / numOfBeatsToShow, [dimensions.width, numOfBeatsToShow]);

	const renderBeatLine = useCallback(
		(beat: number) => {
			// No line necessary for the right edge of the grid
			if (beat === numOfBeatsToShow - 1) return null;
			return <line key={beat} x1={(beat + 1) * segmentWidth} y1={-6} x2={(beat + 1) * segmentWidth} y2={dimensions.height} stroke={token.var("colors.border.default")} strokeWidth={1} />;
		},
		[numOfBeatsToShow, dimensions.height, segmentWidth],
	);

	const renderPrimaryLine = useCallback(
		(beat: number, segmentIndex: number) => {
			if (beat === 0) return null;
			const subSegmentWidth = segmentWidth / snapDivision;
			return <line key={beat} x1={segmentIndex * segmentWidth + beat * subSegmentWidth} y1={0} x2={segmentIndex * segmentWidth + beat * subSegmentWidth} y2={dimensions.height} stroke={token.var("colors.border.subtle")} strokeWidth={1} />;
		},
		[snapDivision, dimensions.height, segmentWidth],
	);

	return (
		<Wrapper role="presentation" width={dimensions.width} height={dimensions.height}>
			<For each={Array.from(range(numOfBeatsToShow))}>
				{(beat, index) => (
					<Fragment key={beat}>
						{renderBeatLine(beat)}
						<For each={Array.from(range(snapDivision))}>{(n) => renderPrimaryLine(n, index)}</For>
					</Fragment>
				)}
			</For>
		</Wrapper>
	);
}

const Wrapper = styled("svg", {
	base: {
		position: "absolute",
		inset: 0,
	},
});

export default EventGridMarkers;
