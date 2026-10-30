import { useHotkey } from "@ark-ui/react/hotkeys";
import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ActionPanel } from "$/components/app/layouts";
import { useUpdateEffect } from "$/components/hooks/use-update-effect";
import { Match, Switch } from "$/components/ui/atoms";
import { useAppSelector } from "$/store/hooks";
import { selectAllSelectedBombNotes, selectAllSelectedColorNotes, selectAllSelectedObstacles, selectModuleEnabled } from "$/store/selectors";
import { DefaultActionPanelGroup, GridActionPanelGroup, GridPresetsActionPanelGroup, NoteDirectionActionPanelGroup, NoteToolActionPanelGroup, ObstaclesActionPanelGroup, SelectionActionPanelGroup } from "./action-panel-groups";

function EditorActionPanel() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const selectedBlocks = useAppSelector(selectAllSelectedColorNotes);
	const selectedMines = useAppSelector(selectAllSelectedBombNotes);
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);
	const isMappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const isAnythingSelected = useMemo(() => selectedBlocks.length > 0 || selectedObstacles.length > 0 || selectedMines.length > 0, [selectedBlocks, selectedObstacles, selectedMines]);

	const [showGridConfig, setShowGridConfig] = useState(false);

	useUpdateEffect(() => {
		if (showGridConfig && isAnythingSelected) {
			// If the user selects something while the grid panel is open, switch to the selection panel
			setShowGridConfig(false);
		}
	}, [selectedBlocks.length + selectedMines.length + selectedObstacles.length]);

	useHotkey({ hotkey: "G", enabled: () => isMappingExtensionsEnabled, action: () => setShowGridConfig((currentVal) => !currentVal) });

	return (
		<ActionPanel.Root>
			<Switch>
				<Match when={showGridConfig}>
					<GridPresetsActionPanelGroup />
					<GridActionPanelGroup finishTweakingGrid={() => setShowGridConfig(false)} />
				</Match>
				<Match when={!isAnythingSelected}>
					<NoteToolActionPanelGroup />
					<NoteDirectionActionPanelGroup />
					<DefaultActionPanelGroup handleGridConfigClick={() => setShowGridConfig(true)} />
				</Match>
				<Match when={isAnythingSelected}>
					<SelectionActionPanelGroup />
					<ObstaclesActionPanelGroup />
					<DefaultActionPanelGroup handleGridConfigClick={() => setShowGridConfig(true)} />
				</Match>
			</Switch>
		</ActionPanel.Root>
	);
}
export default EditorActionPanel;
