import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button, Tooltip } from "$/components/ui/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapById, selectColorScheme, selectNotesEditorTool } from "$/store/selectors";
import { ObjectTool } from "$/types";
import { cycle } from "$/utils";

function NoteToolActionPanelGroup() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/notes" });

	const dispatch = useAppDispatch();
	const beatmap = useAppSelector((state) => selectBeatmapById(state, sid, bid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);

	const [lastSelectedNoteTool, setLastSelectedNoteTool] = useState<ObjectTool>(ObjectTool.RIGHT_NOTE);

	useEffect(() => {
		if (selectedTool === ObjectTool.LEFT_NOTE || selectedTool === ObjectTool.RIGHT_NOTE) {
			setLastSelectedNoteTool(selectedTool);
		}
	}, [selectedTool]);

	const isOneSaber = useMemo(() => beatmap.characteristic === "OneSaber", [beatmap.characteristic]);
	const selectedNoteTool = useMemo(() => (isOneSaber ? ObjectTool.RIGHT_NOTE : lastSelectedNoteTool), [isOneSaber, lastSelectedNoteTool]);

	const handleCycleNoteColor = useCallback(() => {
		if (isOneSaber) return;

		const nextNoteTool = cycle([ObjectTool.LEFT_NOTE, ObjectTool.RIGHT_NOTE], lastSelectedNoteTool);
		setLastSelectedNoteTool(nextNoteTool);

		if (selectedTool === ObjectTool.LEFT_NOTE || selectedTool === ObjectTool.RIGHT_NOTE) {
			dispatch(updateNotesEditorTool(nextNoteTool));
		}
	}, [dispatch, isOneSaber, selectedTool, lastSelectedNoteTool]);

	const updateNoteTool = useCallback(() => {
		const isCurrentNoteTool = selectedTool === ObjectTool.LEFT_NOTE || selectedTool === ObjectTool.RIGHT_NOTE;

		if (isCurrentNoteTool) {
			handleCycleNoteColor();
		} else {
			dispatch(updateNotesEditorTool(selectedNoteTool));
		}
	}, [selectedTool, selectedNoteTool, handleCycleNoteColor, dispatch]);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !hotkeys.getActiveScopes().includes("camera"), [hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Pick / Cycle Color Note Tool", hotkey: "1", action: () => updateNoteTool() });

	useHotkey({ scopes, category, enabled, label: "Pick Bomb Note Tool", hotkey: "2", action: () => dispatch(updateNotesEditorTool(ObjectTool.BOMB_NOTE)) });
	useHotkey({ scopes, category, enabled, label: "Pick Obstacle Tool", hotkey: "3", action: () => dispatch(updateNotesEditorTool(ObjectTool.OBSTACLE)) });

	return (
		<ActionPanelGroup.Root label="Tool">
			<ActionPanelGroup.Section>
				<Tooltip render={() => "Color Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === selectedNoteTool} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool(selectedNoteTool))} onAuxClick={handleCycleNoteColor}>
						<ColorNoteIcon size={20} color={resolveColorForItem(selectedNoteTool, { colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Bomb Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.BOMB_NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool(ObjectTool.BOMB_NOTE))}>
						<BombNoteIcon size={20} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Obstacle"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.OBSTACLE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool(ObjectTool.OBSTACLE))}>
						<ObstacleIcon size={20} color={resolveColorForItem(ObjectTool.OBSTACLE, { colorScheme })} />
					</Button>
				</Tooltip>
			</ActionPanelGroup.Section>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;
