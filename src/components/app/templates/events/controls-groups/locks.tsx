import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { LockIcon, RepeatIcon } from "lucide-react";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { Field, Toggle, Tooltip } from "$/components/ui/compositions";
import { updateEventsEditorMirrorLock, updateEventsEditorWindowLock } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectEventsEditorMirrorLock, selectEventsEditorWindowLock } from "$/store/selectors";
import { HStack } from "$:styled-system/jsx";

function LockControls() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/events" });

	const dispatch = useAppDispatch();
	const isLockedToCurrentWindow = useAppSelector(selectEventsEditorWindowLock);
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Toggle Window Lock", hotkey: "Z", action: () => dispatch(updateEventsEditorWindowLock()) });
	useHotkey({ scopes, category, label: "Toggle Mirror Lock", hotkey: "X", action: () => dispatch(updateEventsEditorMirrorLock()) });

	return (
		<Field cosmetic size="sm" label="Locks">
			<HStack gap={1}>
				<Tooltip render={() => "Loop playback within the current event window"}>
					<Toggle unfocusOnPress pressed={isLockedToCurrentWindow} onPressedChange={(pressed) => dispatch(updateEventsEditorWindowLock(pressed))}>
						<RepeatIcon size={16} />
					</Toggle>
				</Tooltip>
				<Tooltip render={() => "Clone event placements for symmetrical tracks"}>
					<Toggle unfocusOnPress pressed={areLasersLocked} onPressedChange={(pressed) => dispatch(updateEventsEditorMirrorLock(pressed))}>
						<LockIcon size={16} />
					</Toggle>
				</Tooltip>
			</HStack>
		</Field>
	);
}

export default LockControls;
