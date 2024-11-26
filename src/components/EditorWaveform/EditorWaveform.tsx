import { Fragment } from "react";
import styled from "styled-components";

import { UNIT } from "$/constants";
import { useBoundingBox } from "$/hooks";
import { scrubWaveform } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getCursorPosition, getDuration, getGraphicsLevel, getWaveformData, selectIsLoading } from "$/store/selectors";
import { Quality } from "$/types";
import { roundToNearest } from "$/utils";

import Bookmarks from "../Bookmarks";
import CenteredSpinner from "../CenteredSpinner";
import ScrubbableWaveform from "../ScrubbableWaveform";

interface Props {
	height: number;
}

const EditorWaveform = ({ height }: Props) => {
	const waveformData = useAppSelector(getWaveformData);
	const isLoadingSong = useAppSelector(selectIsLoading);
	const duration = useAppSelector(getDuration);
	const cursorPosition = useAppSelector(getCursorPosition);
	const graphicsLevel = useAppSelector(getGraphicsLevel);
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

	return (
		<Wrapper ref={ref}>
			{isLoadingSong && (
				<SpinnerWrapper>
					<CenteredSpinner />
				</SpinnerWrapper>
			)}
			{boundingBox && (
				<Fragment>
					<ScrubbableWaveform width={boundingBox.width} height={height - UNIT * 2} waveformData={waveformData} duration={duration} cursorPosition={roundedCursorPosition} scrubWaveform={(offset) => dispatch(scrubWaveform({ newOffset: offset }))} />
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
