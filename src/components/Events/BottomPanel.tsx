import styled from "styled-components";

import { UNIT } from "$/constants";
import { View } from "$/types";

import EditorNavigationControls from "../EditorNavigationControls";
import EditorStatusBar from "../EditorStatusBar";
import EditorWaveform from "../EditorWaveform";

const PADDING = UNIT * 2;

interface Props {
	contentWidth: number;
}

const EventsBottomPanel = ({ contentWidth }: Props) => {
	// This is a known size because IconButton is always 36px squared, and it's the tallest thing in this child.
	// TODO: Make this relationship explicit, share a constant or something
	const playbackControlsHeight = 36;
	const statusBarHeight = 30;

	const waveformHeight = 80;

	return (
		<Wrapper style={{ width: contentWidth }}>
			<SubWrapper>
				<EditorNavigationControls height={playbackControlsHeight} view={View.LIGHTSHOW} />
			</SubWrapper>
			<SubWrapper>
				<EditorWaveform height={waveformHeight} />
			</SubWrapper>
			<EditorStatusBar height={statusBarHeight} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
  width: 100%;
  height: 179px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: ${PADDING}px;
  background: rgba(0, 0, 0, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
`;
const SubWrapper = styled.div`
  position: relative;
  padding: ${PADDING}px;
  padding-top: 0;
`;

export default EventsBottomPanel;
