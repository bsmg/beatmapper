import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";

import { getHotkeyScopes } from "$/components/app/helpers";
import { decrementEventsEditorZoomLevel, incrementEventsEditorZoomLevel, redoEvents, removeAllSelectedEvents, undoEvents, updateEventsEditorColor, updateEventsEditorEditMode, updateEventsEditorMirrorLock, updateEventsEditorTool, updateEventsEditorWindowLock } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading } from "$/store/selectors";
import { EventColor, EventEditMode, EventTool } from "$/types";

function EventsEditorShortcuts() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const isEnabled = useMemo(() => !isLoading, [isLoading]);

	useHotkey({ hotkey: "-", scopes: scopes, enabled: isEnabled, action: () => dispatch(decrementEventsEditorZoomLevel()) });
	useHotkey({ hotkey: "=", scopes: scopes, enabled: isEnabled, action: () => dispatch(incrementEventsEditorZoomLevel()) });

	useHotkey({ hotkey: "A", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorEditMode(EventEditMode.PLACE)) });
	useHotkey({ hotkey: "S", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorEditMode(EventEditMode.SELECT)) });

	useHotkey({ hotkey: "Z", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorWindowLock()) });
	useHotkey({ hotkey: "X", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorMirrorLock()) });

	useHotkey({ hotkey: "1", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorTool(EventTool.ON)) });
	useHotkey({ hotkey: "2", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorTool(EventTool.OFF)) });
	useHotkey({ hotkey: "3", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorTool(EventTool.FLASH)) });
	useHotkey({ hotkey: "4", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorTool(EventTool.FADE)) });
	useHotkey({ hotkey: "5", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorTool(EventTool.TRANSITION)) });

	useHotkey({ hotkey: "R", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorColor(EventColor.PRIMARY)) });
	useHotkey({ hotkey: "B", scopes: scopes, enabled: isEnabled, action: () => dispatch(updateEventsEditorColor(EventColor.SECONDARY)) });

	useHotkey({ hotkey: "Delete", scopes: scopes, enabled: isEnabled, action: () => dispatch(removeAllSelectedEvents()) });

	useHotkey({ hotkey: "Mod+Z", scopes: scopes, enabled: isEnabled, action: () => dispatch(undoEvents()) });
	useHotkey({ hotkey: "Mod+Shift+Z", scopes: scopes, enabled: isEnabled, action: () => dispatch(redoEvents()) });

	return null;
}

export default EventsEditorShortcuts;
