import { Fragment, useMemo, useState } from "react";

import { useOnChange, useOnKeydown } from "$/components/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectAllSelectedBombNotes, selectAllSelectedColorNotes, selectAllSelectedObstacles, selectPlacementMode } from "$/store/selectors";
import { ObjectPlacementMode, type SongId } from "$/types";

import { styled } from "$:styled-system/jsx";
import { center, vstack } from "$:styled-system/patterns";
import { Presence } from "@ark-ui/react";
import DefaultActionPanel from "./default";
import GridActionPanel from "./grid";
import SelectionActionPanel from "./selection";

interface Props {
	sid: SongId;
}
function EditorActionPanel({ sid }: Props) {
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

	useOnKeydown(
		"KeyG",
		() => {
			if (mappingMode === ObjectPlacementMode.EXTENSIONS) {
				setShowGridConfig((currentVal) => !currentVal);
			}
		},
		[mappingMode],
	);

	// On smaller windows, the content won't fit in the side panel.
	// By default we disable all mousewheel action since it causes problems with our main view,
	// but if the cursor is over this panel, we'll allow it to behave normally by not bubbling that event to the window handler (which prevents it).
	return (
		<OuterWrapper onWheel={(ev) => ev.stopPropagation()}>
			<Wrapper>
				<Presence asChild present={!showGridConfig && !isAnythingSelected} lazyMount unmountOnExit>
					<Fragment>
						<DefaultActionPanel sid={sid} handleGridConfigClick={() => setShowGridConfig(true)} />
					</Fragment>
				</Presence>
				<Presence asChild present={isAnythingSelected} lazyMount unmountOnExit>
					<Fragment>
						<SelectionActionPanel sid={sid} numOfSelectedBlocks={selectedBlocks.length} numOfSelectedMines={selectedMines.length} numOfSelectedObstacles={selectedObstacles.length} />
					</Fragment>
				</Presence>
				<Presence asChild present={showGridConfig} lazyMount unmountOnExit>
					<Fragment>
						<GridActionPanel sid={sid} finishTweakingGrid={() => setShowGridConfig(false)} />
					</Fragment>
				</Presence>
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
		color: "white",
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
