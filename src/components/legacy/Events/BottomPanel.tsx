import { View } from "$/types";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import EditorNavigationControls from "../EditorNavigationControls";
import EditorStatusBar from "../EditorStatusBar";
import EditorWaveform from "../EditorWaveform";

interface Props {
	contentWidth: number;
}
const EventsBottomPanel = ({ contentWidth }: Props) => {
	const waveformHeight = 80;

	return (
		<Wrapper style={{ width: contentWidth }}>
			<SubWrapper>
				<EditorNavigationControls view={View.LIGHTSHOW} />
			</SubWrapper>
			<SubWrapper>
				<EditorWaveform height={waveformHeight} />
			</SubWrapper>
			<EditorStatusBar />
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: stack.raw({
		width: "100%",
		height: "179px",
		justify: "space-between",
		gap: 0,
		paddingTop: 2,
		backgroundColor: "bg.translucent",
		borderTopWidth: "sm",
		borderColor: "border.muted",
		backdropFilter: "blur(8px)",
		userSelect: "none",
	}),
});

const SubWrapper = styled("div", {
	base: {
		position: "relative",
		margin: 2,
		marginTop: 0,
	},
});

export default EventsBottomPanel;
