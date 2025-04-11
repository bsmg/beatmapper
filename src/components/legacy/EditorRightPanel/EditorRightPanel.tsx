import { type ReactNode, useState } from "react";

import { useOnChange, useOnKeydown } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllSelectedBombNotes, selectAllSelectedColorNotes, selectAllSelectedObstacles, selectPlacementMode } from "$/store/selectors";
import { ObjectPlacementMode } from "$/types";

import { VStack, styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import ItemGrid from "../ItemGrid";
import NoteGrid from "../NoteGrid";
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
			<VStack gap={4}>
				<NoteGrid />
				<ItemGrid />
				<Actions handleGridConfigClick={() => setShowGridConfig(true)} />
			</VStack>
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

const OuterWrapper = styled("div", {
	base: center.raw({
		position: "absolute",
		top: 0,
		bottom: "{sizes.navigationPanel}",
		right: 0,
		width: "200px",
		pointerEvents: "none",
	}),
});

const Wrapper = styled("div", {
	base: {
		padding: 4,
		backgroundColor: "bg.translucent",
		color: "white",
		borderLeftRadius: "md",
		borderBlockWidth: "sm",
		borderLeftWidth: "sm",
		borderColor: "border.muted",
		backdropFilter: "blur(8px)",
		userSelect: "none",
		overflow: "auto",
		pointerEvents: "auto",
	},
});

export default EditorRightPanel;
