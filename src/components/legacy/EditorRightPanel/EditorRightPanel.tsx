import { Fragment, type ReactNode, useState } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { useOnChange, useOnKeydown } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllSelectedBombNotes, selectAllSelectedColorNotes, selectAllSelectedObstacles, selectPlacementMode } from "$/store/selectors";
import { ObjectPlacementMode } from "$/types";

import ItemGrid from "../ItemGrid";
import NoteGrid from "../NoteGrid";
import Spacer from "../Spacer";
import Actions from "./Actions";
import GridConfig from "./GridConfig";
import SelectionInfo from "./SelectionInfo";

const EditorRightPanel = () => {
	const songId = useAppSelector(selectActiveSongId);
	const mappingMode = useAppSelector((state) => selectPlacementMode(state, songId));
	const selectedBlocks = useAppSelector(selectAllSelectedColorNotes);
	const selectedMines = useAppSelector(selectAllSelectedBombNotes);
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);

	const isAnythingSelected = selectedBlocks.length > 0 || selectedObstacles.length > 0 || selectedMines.length > 0;

	// This panel adapts based on the current situation.
	let panelContents: ReactNode;

	const [showGridConfig, setShowGridConfig] = useState(false);

	useOnChange(
		() => {
			if (showGridConfig && isAnythingSelected) {
				// If the user selects something while the grid panel is open, switch to the selection panel
				setShowGridConfig(false);
			}
		},
		selectedBlocks.length + selectedMines.length + selectedObstacles.length,
	);

	useOnKeydown(
		"KeyG",
		() => {
			if (mappingMode === ObjectPlacementMode.EXTENSIONS) {
				setShowGridConfig((currentVal) => !currentVal);
			}
		},
		[mappingMode],
	);

	if (showGridConfig) {
		panelContents = <GridConfig finishTweakingGrid={() => setShowGridConfig(false)} />;
	} else if (isAnythingSelected) {
		panelContents = <SelectionInfo numOfSelectedBlocks={selectedBlocks.length} numOfSelectedMines={selectedMines.length} numOfSelectedObstacles={selectedObstacles.length} />;
	} else {
		panelContents = (
			<Fragment>
				<NoteGrid />
				<Spacer size={token.var("spacing.4")} />
				<ItemGrid />
				<Spacer size={token.var("spacing.4")} />
				<Actions handleGridConfigClick={() => setShowGridConfig(true)} />
			</Fragment>
		);
	}

	return (
		<OuterWrapper
			onWheel={(ev) => {
				// On smaller windows, the content won't fit in the side panel.
				// By default we disable all mousewheel action since it causes problems with our main view,
				// but if the cursor is over this panel, we'll allow it to behave normally by not bubbling that event to the window handler (which prevents it).
				ev.stopPropagation();
			}}
		>
			<Wrapper>{panelContents}</Wrapper>
		</OuterWrapper>
	);
};

const OuterWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: ${token.var("sizes.navigationPanel")};
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
`;

const Wrapper = styled.div`
  color: #fff;
  padding: ${token.var("spacing.4")} ${token.var("spacing.3")};
  background: rgba(0, 0, 0, 0.45);
  border-radius: ${token.var("spacing.1")} 0 0 ${token.var("spacing.1")};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
  overflow: auto;
  pointer-events: auto;
`;

export default EditorRightPanel;
