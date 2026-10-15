import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { ClipboardCopyIcon, ClipboardPasteIcon, ClipboardXIcon, RedoIcon, UndoIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Fragment, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { Button, Field, Tooltip } from "$/components/ui/compositions";
import { ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import { copySelection, cutSelection, decrementEventsEditorZoomLevel, incrementEventsEditorZoomLevel, pasteSelection, redoEvents, toggleSelectAllEntities, undoEvents } from "$/store/actions";
import { selectClipboardHasEvents } from "$/store/features/clipboard.slice";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAnySelectedEvents, selectEventsCanRedo, selectEventsCanUndo, selectEventsEditorZoomLevel } from "$/store/selectors";
import { HStack } from "$:styled-system/jsx";

function DefaultControls() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/events" });

	const dispatch = useAppDispatch();
	const canUndo = useAppSelector(selectEventsCanUndo);
	const canRedo = useAppSelector(selectEventsCanRedo);
	const isAnythingSelected = useAppSelector(selectAnySelectedEvents);
	const hasCopiedEvents = useAppSelector(selectClipboardHasEvents);
	const zoomLevel = useAppSelector(selectEventsEditorZoomLevel);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Undo History Step", hotkey: "Mod+Z", action: () => dispatch(undoEvents({ shouldJump: hotkeys.getActiveScopes().includes("navigation") })) });
	useHotkey({ scopes, category, label: "Redo History Step", hotkey: "Mod+Shift+Z", action: () => dispatch(redoEvents({ shouldJump: hotkeys.getActiveScopes().includes("navigation") })) });

	useHotkey({ scopes, category, label: "Cut Selection", hotkey: "Mod+X", action: () => dispatch(cutSelection()) });
	useHotkey({ scopes, category, label: "Copy Selection", hotkey: "Mod+C", action: () => dispatch(copySelection()) });
	useHotkey({ scopes, category, label: "Paste Selection", hotkey: "Mod+V", action: () => dispatch(pasteSelection()) });

	useHotkey({ scopes, category, label: "Select All Events", hotkey: "Mod+A", action: () => dispatch(toggleSelectAllEntities()) });

	return (
		<Fragment>
			<Field cosmetic size="sm" label="History" align="end">
				<HStack gap={1}>
					<Tooltip render={() => "Undo"}>
						<Button variant="subtle" size="sm" disabled={!canUndo} unfocusOnPress onClick={() => dispatch(undoEvents({ shouldJump: hotkeys.getActiveScopes().includes("navigation") }))}>
							<UndoIcon size={14} />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Redo"}>
						<Button variant="subtle" size="sm" disabled={!canRedo} unfocusOnPress onClick={() => dispatch(redoEvents({ shouldJump: hotkeys.getActiveScopes().includes("navigation") }))}>
							<RedoIcon size={14} />
						</Button>
					</Tooltip>
				</HStack>
			</Field>
			<Field cosmetic size="sm" label="Clipboard" align="end">
				<HStack gap={1}>
					<Tooltip render={() => "Cut selection"}>
						<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnPress onClick={() => dispatch(cutSelection())}>
							<ClipboardXIcon size={14} />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Copy selection"}>
						<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnPress onClick={() => dispatch(copySelection())}>
							<ClipboardCopyIcon size={14} />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Paste selection"}>
						<Button variant="subtle" size="sm" disabled={!hasCopiedEvents} unfocusOnPress onClick={() => dispatch(pasteSelection())}>
							<ClipboardPasteIcon size={14} />
						</Button>
					</Tooltip>
				</HStack>
			</Field>
			<Field cosmetic size="sm" label="Zoom" align="end">
				<HStack gap={1}>
					<Tooltip render={() => "Zoom in"}>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(decrementEventsEditorZoomLevel())} disabled={zoomLevel === ZOOM_LEVEL_MIN}>
							<ZoomOutIcon size={14} />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Zoom out"}>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(incrementEventsEditorZoomLevel())} disabled={zoomLevel === ZOOM_LEVEL_MAX}>
							<ZoomInIcon size={14} />
						</Button>
					</Tooltip>
				</HStack>
			</Field>
		</Fragment>
	);
}

export default DefaultControls;
