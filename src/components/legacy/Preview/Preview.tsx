import { View } from "$/types";

import { styled } from "$:styled-system/jsx";
import EditorBottomPanel from "../EditorBottomPanel";
import GlobalShortcuts from "../GlobalShortcuts";
import ReduxForwardingCanvas from "../ReduxForwardingCanvas";
// import KeyboardShortcuts from './KeyboardShortcuts';
import LightingPreview from "./LightingPreview";

const Preview = () => {
	return (
		<Wrapper>
			<ReduxForwardingCanvas>
				<LightingPreview />
			</ReduxForwardingCanvas>

			<EditorBottomPanel />

			<GlobalShortcuts view={View.PREVIEW} />
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		backgroundColor: "black",
		boxSize: "100%",
	},
});
export default Preview;
