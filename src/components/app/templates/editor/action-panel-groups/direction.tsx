import { useHotkey, usePressedKeys } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { NoteDirection } from "bsmap";
import { ArrowDownIcon, ArrowDownLeftIcon, ArrowDownRightIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowUpLeftIcon, ArrowUpRightIcon, CircleIcon } from "lucide-react";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";
import { updateNotesEditorDirection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNotesEditorDirection, selectNotesEditorTool } from "$/store/selectors";
import { ObjectTool } from "$/types";
import { Grid } from "$:styled-system/jsx";

function NoteDirectionActionPanelGroup() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/notes" });

	const dispatch = useAppDispatch();
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const selectedNoteTool = useAppSelector(selectNotesEditorTool);

	const isDisabled = useMemo(() => selectedNoteTool !== ObjectTool.LEFT_NOTE && selectedNoteTool !== ObjectTool.RIGHT_NOTE, [selectedNoteTool]);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const pressedKeys = usePressedKeys();

	useHotkey({
		scopes,
		category,
		label: "Pick Up Direction",
		hotkey: "W",
		action: () => {
			if (pressedKeys.includes("A")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
			if (pressedKeys.includes("D")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
			return dispatch(updateNotesEditorDirection(NoteDirection.UP));
		},
	});
	useHotkey({
		scopes,
		category,
		label: "Pick Down Direction",
		hotkey: "S",
		action: () => {
			if (pressedKeys.includes("A")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
			if (pressedKeys.includes("D")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
			return dispatch(updateNotesEditorDirection(NoteDirection.DOWN));
		},
	});
	useHotkey({
		scopes,
		category,
		label: "Pick Left Direction",
		hotkey: "A",
		action: () => {
			if (pressedKeys.includes("W")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
			if (pressedKeys.includes("S")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
			return dispatch(updateNotesEditorDirection(NoteDirection.LEFT));
		},
	});
	useHotkey({
		scopes,
		category,
		label: "Pick Right Direction",
		hotkey: "D",
		action: () => {
			if (pressedKeys.includes("W")) return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
			if (pressedKeys.includes("S")) return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
			return dispatch(updateNotesEditorDirection(NoteDirection.RIGHT));
		},
	});

	useHotkey({ scopes, category, label: "Pick Any Direction", hotkey: "F", action: () => dispatch(updateNotesEditorDirection(NoteDirection.ANY)) });

	return (
		<ActionPanelGroup.Root label="Notes">
			<Grid columns={3} gap={0.5}>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.UP_LEFT} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT))}>
					<ArrowUpLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.UP} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.UP))}>
					<ArrowUpIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.UP_RIGHT} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT))}>
					<ArrowUpRightIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.LEFT} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.LEFT))}>
					<ArrowLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.ANY} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.ANY))}>
					<CircleIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.RIGHT} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.RIGHT))}>
					<ArrowRightIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.DOWN_LEFT} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT))}>
					<ArrowDownLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.DOWN} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.DOWN))}>
					<ArrowDownIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} aria-pressed={selectedDirection === NoteDirection.DOWN_RIGHT} unfocusOnPress onClick={() => dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT))}>
					<ArrowDownRightIcon />
				</Button>
			</Grid>
		</ActionPanelGroup.Root>
	);
}

export default NoteDirectionActionPanelGroup;
