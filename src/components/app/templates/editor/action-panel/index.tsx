import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useOnChange, useOnKeydown } from "$/components/hooks";
import { Match, Switch } from "$/components/ui/atoms";
import { useAppSelector } from "$/store/hooks";
import { selectAllSelectedBombNotes, selectAllSelectedColorNotes, selectAllSelectedObstacles, selectPlacementMode } from "$/store/selectors";
import { ObjectPlacementMode } from "$/types";
import { styled } from "$:styled-system/jsx";
import { center, vstack } from "$:styled-system/patterns";
import DefaultActionPanel from "./default";
import GridActionPanel from "./grid";
import SelectionActionPanel from "./selection";

function EditorActionPanel() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const mappingMode = useAppSelector((state) => selectPlacementMode(state, sid));
	const selectedBlocks = useAppSelector(selectAllSelectedColorNotes);
	const selectedMines = useAppSelector(selectAllSelectedBombNotes);
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);

	const isAnythingSelected = useMemo(() => selectedBlocks.length > 0 || selectedObstacles.length > 0 || selectedMines.length > 0, [selectedBlocks, selectedObstacles, selectedMines]);

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

	useOnKeydown("KeyG", () => {
		if (mappingMode === ObjectPlacementMode.EXTENSIONS) {
			setShowGridConfig((currentVal) => !currentVal);
		}
	}, [mappingMode]);

	return (
		<OuterWrapper onWheel={(ev) => ev.stopPropagation()}>
			<Wrapper>
				<Switch fallback={<DefaultActionPanel handleGridConfigClick={() => setShowGridConfig(true)} />}>
					<Match when={isAnythingSelected}>
						<SelectionActionPanel numOfSelectedBlocks={selectedBlocks.length} numOfSelectedMines={selectedMines.length} numOfSelectedObstacles={selectedObstacles.length} />
					</Match>
					<Match when={showGridConfig}>
						<GridActionPanel finishTweakingGrid={() => setShowGridConfig(false)} />
					</Match>
				</Switch>
			</Wrapper>
		</OuterWrapper>
	);
}

const OuterWrapper = styled("div", {
	base: center.raw({
		position: "absolute",
		top: 0,
		bottom: "calc({sizes.navigationPanel} + {sizes.statusBar})",
		right: 0,
		width: "200px",
		pointerEvents: "none",
	}),
});

const Wrapper = styled("div", {
	base: vstack.raw({
		height: "fit-content",
		maxHeight: "100%",
		justify: "start",
		padding: 4,
		gap: 4,
		backgroundColor: "bg.translucent",
		color: "fg.default",
		borderLeftRadius: "md",
		borderBlockWidth: "sm",
		borderLeftWidth: "sm",
		borderColor: "border.muted",
		backdropFilter: "blur(8px)",
		pointerEvents: "auto",
		userSelect: "none",
		overflowY: "auto",
		_scrollbar: { display: "none" },
	}),
});

export default EditorActionPanel;
