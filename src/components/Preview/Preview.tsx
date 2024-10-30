import styled from "styled-components";

import { View } from "$/types";

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

const Wrapper = styled.div`
  background: #000;
  width: 100%;
  height: 100%;
`;

export default Preview;
