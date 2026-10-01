import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { type MouseEventHandler, useMemo } from "react";

import { createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { Button, Tooltip, usePrompt } from "$/components/ui/compositions";
import { calculateQuickSelectRange } from "$/helpers/editor.helpers";
import { copySelection, cutSelection, jumpToBeat, pasteSelection, redoObjects, selectAllEntitiesInRange, undoObjects } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAnySelectedObjects, selectClipboardHasObjects, selectCursorPositionInBeats, selectModuleEnabled, selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";

interface Props {
	handleGridConfigClick?: MouseEventHandler;
}
function DefaultActionPanelGroup({ handleGridConfigClick }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/notes" });

	const dispatch = useAppDispatch();
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);
	const isAnythingSelected = useAppSelector(selectAnySelectedObjects);
	const hasCopiedNotes = useAppSelector(selectClipboardHasObjects);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const mappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const { trigger: triggerQuickSelect } = usePrompt(
		createQuickSelectPrompt({
			render: ({ form }) => <form.AppField name="range">{(ctx) => <ctx.Input autoFocus label="Range" placeholder="8-12" />}</form.AppField>,
			onSubmit: ({ value: { range } }) => {
				const [startBeat, endBeat] = calculateQuickSelectRange(range, cursorPositionInBeats, 0.01);
				dispatch(selectAllEntitiesInRange({ startBeat, endBeat }));
				dispatch(jumpToBeat({ value: startBeat }));
			},
		}),
	);
	const { trigger: triggerJumpToBeat } = usePrompt(
		createJumpToBeatPrompt({
			render: ({ form }) => <form.AppField name="beatNum">{(ctx) => <ctx.NumberInput autoFocus label="Beat" placeholder="4" />}</form.AppField>,
			onSubmit: ({ value: { beatNum } }) => dispatch(jumpToBeat({ value: beatNum })),
		}),
	);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const hotkeys = useHotkeyStore();

	useHotkey({ scopes, category, label: "Undo History Step", hotkey: "Mod+Z", action: () => dispatch(undoObjects({ shouldJump: hotkeys.getActiveScopes().includes("navigation") })) });
	useHotkey({ scopes, category, label: "Redo History Step", hotkey: "Mod+Shift+Z", action: () => dispatch(redoObjects({ shouldJump: hotkeys.getActiveScopes().includes("navigation") })) });

	useHotkey({ scopes, category, label: "Cut Selection", hotkey: "Mod+X", action: () => dispatch(cutSelection()) });
	useHotkey({ scopes, category, label: "Copy Selection", hotkey: "Mod+C", action: () => dispatch(copySelection()) });
	useHotkey({ scopes, category, label: "Paste Selection", hotkey: "Mod+V", action: () => dispatch(pasteSelection()) });

	return (
		<ActionPanelGroup.Root label="Actions">
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" disabled={!canUndo} unfocusOnPress onClick={() => dispatch(undoObjects({ shouldJump: hotkeys.getActiveScopes().includes("navigation") }))}>
					Undo
				</Button>
				<Button variant="subtle" size="sm" disabled={!canRedo} unfocusOnPress onClick={() => dispatch(redoObjects({ shouldJump: hotkeys.getActiveScopes().includes("navigation") }))}>
					Redo
				</Button>
			</ActionPanelGroup.ActionGroup>
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnPress onClick={() => dispatch(cutSelection())}>
					Cut
				</Button>
				<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnPress onClick={() => dispatch(copySelection())}>
					Copy
				</Button>
				<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} unfocusOnPress onClick={() => dispatch(pasteSelection())}>
					Paste Selection
				</Button>
			</ActionPanelGroup.ActionGroup>
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Select everything over a time period"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={triggerQuickSelect}>
						Quick-select
					</Button>
				</Tooltip>
				<Tooltip render={() => "Jump to a specific beat number"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={triggerJumpToBeat}>
						Jump to Beat
					</Button>
				</Tooltip>
				<Show when={mappingExtensionsEnabled}>
					<Tooltip render={() => "Change the number of columns/rows"}>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={handleGridConfigClick}>
							Customize Grid
						</Button>
					</Tooltip>
				</Show>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default DefaultActionPanelGroup;
