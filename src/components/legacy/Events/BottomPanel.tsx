import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { View } from "$/types";

import EditorNavigationControls from "../EditorNavigationControls";
import EditorStatusBar from "../EditorStatusBar";
import EditorWaveform from "../EditorWaveform";

const PADDING = token.var("spacing.2");

interface Props {
	contentWidth: number;
}

const EventsBottomPanel = ({ contentWidth }: Props) => {
	// This is a known size because IconButton is always 36px squared, and it's the tallest thing in this child.
	const playbackControlsHeight = token.var("sizes.iconButton");
	const statusBarHeight = token.var("sizes.statusBar");

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
  padding-top: ${PADDING};
  background: rgba(0, 0, 0, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
`;
const SubWrapper = styled.div`
  position: relative;
  padding: ${PADDING};
  padding-top: 0;
`;

export default EventsBottomPanel;
