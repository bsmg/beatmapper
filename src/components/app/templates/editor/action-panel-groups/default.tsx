import { useParams } from "@tanstack/react-router";
import type { MouseEventHandler } from "react";

import { createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { Button, Tooltip, usePrompt } from "$/components/ui/compositions";
import { copySelection, cutSelection, jumpToBeat, pasteSelection, redoObjects, selectAllEntitiesInRange, undoObjects } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAnySelectedObjects, selectClipboardHasObjects, selectModuleEnabled, selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";

interface Props {
	handleGridConfigClick?: MouseEventHandler;
}
function DefaultActionPanelGroup({ handleGridConfigClick }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);
	const isAnythingSelected = useAppSelector(selectAnySelectedObjects);
	const hasCopiedNotes = useAppSelector(selectClipboardHasObjects);
	const mappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const { trigger: triggerQuickSelect } = usePrompt(
		createQuickSelectPrompt({
			render: ({ form }) => <form.AppField name="range">{(ctx) => <ctx.Input autoFocus label="Range" placeholder="8-12" />}</form.AppField>,
			onSubmit: ({ value: { range } }) => {
				let [startBeat, endBeat] = range
					.trim()
					.split("-")
					.map((x) => Number.parseFloat(x));
				if (typeof endBeat !== "number") {
					endBeat = Number.POSITIVE_INFINITY;
				}
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

	return (
		<ActionPanelGroup.Root label="Actions">
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" disabled={!canUndo} unfocusOnPress onClick={() => dispatch(undoObjects())}>
					Undo
				</Button>
				<Button variant="subtle" size="sm" disabled={!canRedo} unfocusOnPress onClick={() => dispatch(redoObjects())}>
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
