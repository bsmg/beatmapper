import { Fragment, useMemo } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { useBoundingBox } from "$/hooks";
import { scrubWaveform } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectDuration, selectGraphicsQuality, selectIsLoading, selectWaveformData } from "$/store/selectors";
import { Quality } from "$/types";
import { roundToNearest } from "$/utils";

import Bookmarks from "../Bookmarks";
import CenteredSpinner from "../CenteredSpinner";
import ScrubbableWaveform from "../ScrubbableWaveform";

interface Props {
	height: number;
}

const EditorWaveform = ({ height }: Props) => {
	const waveformData = useAppSelector(selectWaveformData);
	const isLoadingSong = useAppSelector(selectIsLoading);
	const duration = useAppSelector(selectDuration);
	const cursorPosition = useAppSelector(selectCursorPosition);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);
	const dispatch = useAppDispatch();
	const [ref, boundingBox] = useBoundingBox<HTMLDivElement>();

	// Updating this waveform is surprisingly expensive! We'll throttle its rendering by rounding the cursor position for lower graphics settings.
	// Because it's a pure component, providing the same cursorPosition means that the rendering will be skipped for equal values.
	let roundedCursorPosition: number;
	if (graphicsLevel === Quality.LOW) {
		roundedCursorPosition = roundToNearest(cursorPosition, 150);
	} else if (graphicsLevel === Quality.MEDIUM) {
		roundedCursorPosition = roundToNearest(cursorPosition, 75);
	} else {
		roundedCursorPosition = cursorPosition;
	}

	const waveformHeight = useMemo(() => height - Number.parseFloat(token("spacing.2")), [height]);

	return (
		<Wrapper ref={ref}>
			{isLoadingSong && (
				<SpinnerWrapper>
					<CenteredSpinner />
				</SpinnerWrapper>
			)}
			{boundingBox && (
				<Fragment>
					<ScrubbableWaveform width={boundingBox.width} height={waveformHeight} waveformData={waveformData} duration={duration} cursorPosition={roundedCursorPosition} scrubWaveform={(offset) => dispatch(scrubWaveform({ newOffset: offset }))} />
					{!isLoadingSong && <Bookmarks />}
				</Fragment>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

export default EditorWaveform;
