import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button, Tooltip } from "$/components/ui/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { cycleToNextTool, cycleToPrevTool, updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectNotesEditorTool } from "$/store/selectors";
import { ObjectTool } from "$/types";

function NoteToolActionPanelGroup() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/notes" });

	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !hotkeys.getActiveScopes().includes("camera"), [hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Pick Left Color Note Tool", hotkey: "1", action: () => dispatch(updateNotesEditorTool(ObjectTool.LEFT_NOTE)) });
	useHotkey({ scopes, category, enabled, label: "Pick Right Color Note Tool", hotkey: "2", action: () => dispatch(updateNotesEditorTool(ObjectTool.RIGHT_NOTE)) });
	useHotkey({ scopes, category, enabled, label: "Pick Bomb Note Tool", hotkey: "3", action: () => dispatch(updateNotesEditorTool(ObjectTool.BOMB_NOTE)) });
	useHotkey({ scopes, category, enabled, label: "Pick Obstacle Tool", hotkey: "4", action: () => dispatch(updateNotesEditorTool(ObjectTool.OBSTACLE)) });

	useHotkey({ scopes, category, label: "Cycle to Next Tool", hotkey: "Tab", action: () => dispatch(cycleToNextTool()) });
	useHotkey({ scopes, category, label: "Cycle to Previous Tool", hotkey: "Shift+Tab", action: () => dispatch(cycleToPrevTool()) });

	return (
		<ActionPanelGroup.Root label="Items">
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Left Color Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.LEFT_NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool(ObjectTool.LEFT_NOTE))}>
						<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.LEFT_NOTE, { colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Right Color Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.RIGHT_NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool(ObjectTool.RIGHT_NOTE))}>
						<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.RIGHT_NOTE, { colorScheme })} />
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
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;
