import type { SongId } from "$/types";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { EditorAudioVisualizer } from "$/components/app/templates/editor";
import EditorNavigationControls from "./playback";

interface Props {
	sid: SongId;
}
function EditorNavigationPanel({ sid }: Props) {
	return (
		<Wrapper>
			<SubWrapper>
				<EditorNavigationControls sid={sid} />
			</SubWrapper>
			<SubWrapper>
				<EditorAudioVisualizer sid={sid} />
			</SubWrapper>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		position: "absolute",
		insetInline: 0,
		bottom: "{sizes.statusBar}",
		justify: "space-between",
		gap: 2,
		paddingBlock: 2,
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
		marginInline: 2,
	},
});

export default EditorNavigationPanel;
