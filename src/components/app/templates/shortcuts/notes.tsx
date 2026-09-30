import { useHotkey, usePressedKeys } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { NoteDirection } from "bsmap";
import { useMemo } from "react";

import { getHotkeyScopes } from "$/components/app/helpers";
import { mirrorSelection, redoObjects, removeAllSelectedObjects, undoObjects, updateNotesEditorDirection, updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading } from "$/store/selectors";
import { ObjectTool } from "$/types";

function NotesEditorShortcuts() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const isEnabled = useMemo(() => !isLoading, [isLoading]);

	useHotkey({ hotkey: "R", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorTool(ObjectTool.LEFT_NOTE)) });
	useHotkey({ hotkey: "B", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorTool(ObjectTool.RIGHT_NOTE)) });

	useHotkey({ hotkey: "1", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorTool(ObjectTool.LEFT_NOTE)) });
	useHotkey({ hotkey: "2", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorTool(ObjectTool.RIGHT_NOTE)) });
	useHotkey({ hotkey: "3", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorTool(ObjectTool.BOMB_NOTE)) });
	useHotkey({ hotkey: "4", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorTool(ObjectTool.OBSTACLE)) });

	useHotkey({ hotkey: "H", scopes: scopes, enabled: isEnabled, action: () => dispatch(mirrorSelection({ axis: "horizontal" })) });
	useHotkey({ hotkey: "V", scopes: scopes, enabled: isEnabled, action: () => dispatch(mirrorSelection({ axis: "vertical" })) });

	const pressed = usePressedKeys();

	useHotkey({
		hotkey: "W",
		scopes: scopes,
		enabled: isEnabled,
		action: () => {
			if (pressed.includes("A")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
			if (pressed.includes("D")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
			return dispatch(updateNotesEditorDirection(NoteDirection.UP));
		},
	});
	useHotkey({
		hotkey: "S",
		scopes: scopes,
		enabled: isEnabled,
		action: () => {
			if (pressed.includes("A")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
			if (pressed.includes("D")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
			return dispatch(updateNotesEditorDirection(NoteDirection.DOWN));
		},
	});
	useHotkey({
		hotkey: "A",
		scopes: scopes,
		enabled: isEnabled,
		action: () => {
			if (pressed.includes("W")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
			if (pressed.includes("S")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
			return dispatch(updateNotesEditorDirection(NoteDirection.LEFT));
		},
	});
	useHotkey({
		hotkey: "D",
		scopes: scopes,
		enabled: isEnabled,
		action: () => {
			if (pressed.includes("W")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
			if (pressed.includes("S")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
			return dispatch(updateNotesEditorDirection(NoteDirection.RIGHT));
		},
	});

	useHotkey({ hotkey: "F", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateNotesEditorDirection(NoteDirection.ANY)) });

	useHotkey({ hotkey: "Delete", scopes: scopes, enabled: isEnabled, action: () => dispatch(removeAllSelectedObjects()) });

	useHotkey({ hotkey: "Mod+Z", scopes: scopes, enabled: isEnabled, action: () => dispatch(undoObjects()) });
	useHotkey({ hotkey: "Mod+Shift+Z", scopes: scopes, enabled: isEnabled, action: () => dispatch(redoObjects()) });

	return null;
}

export default NotesEditorShortcuts;
