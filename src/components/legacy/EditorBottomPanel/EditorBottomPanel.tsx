import { View } from "$/types";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import EditorNavigationControls from "../EditorNavigationControls";
import EditorStatusBar from "../EditorStatusBar";
import EditorWaveform from "../EditorWaveform";

const EditorBottomPanel = () => {
	const waveformHeight = 80;

	return (
		<Wrapper>
			<SubWrapper>
				<EditorNavigationControls view={View.BEATMAP} />
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
		position: "absolute",
		insetInline: 0,
		bottom: 0,
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

export default EditorBottomPanel;
