import styled from "styled-components";

import { type SongId, View } from "$/types";

import EditorBottomPanel from "../EditorBottomPanel";
import EditorRightPanel from "../EditorRightPanel";
import GlobalShortcuts from "../GlobalShortcuts";
import MapVisualization from "../MapVisualization";
import ReduxForwardingCanvas from "../ReduxForwardingCanvas";
import SongInfo from "../SongInfo";
import KeyboardShortcuts from "./KeyboardShortcuts";

interface Props {
	songId: SongId;
}
const NotesEditor = ({ songId }: Props) => {
	return (
		<Wrapper>
			<SongInfo songId={songId} showDifficultySelector />

			<ReduxForwardingCanvas>
				<MapVisualization />
			</ReduxForwardingCanvas>

			<EditorBottomPanel />
			<EditorRightPanel />

			<KeyboardShortcuts />
			<GlobalShortcuts view={View.BEATMAP} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
  background: #000;
  width: 100%;
  height: 100%;
`;

export default NotesEditor;
