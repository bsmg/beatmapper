import { useParams, useRouteContext } from "@tanstack/react-router";
import type { MouseEventHandler } from "react";

import { createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { ActionPanelGroup } from "$/components/app/layouts";
import ClipboardActionPanelActionGroup from "$/components/app/templates/action-panel-groups/clipboard";
import { Button, Tooltip, usePrompt } from "$/components/ui/compositions";
import { jumpToBeat, selectAllEntitiesInRange } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectModuleEnabled } from "$/store/selectors";
import HistoryActionPanelActionGroup from "./history";

interface Props {
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanelGroup({ handleGridConfigClick }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const mappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const { trigger: triggerQuickSelect } = usePrompt(
		createQuickSelectPrompt({
			render: ({ form }) => <form.AppField name="range">{(ctx) => <ctx.Input autoFocus label="Range" placeholder="8-12" />}</form.AppField>,
			onSubmit: ({ value: { start, end } }) => dispatch(selectAllEntitiesInRange({ songId: sid, view: view, start, end })),
		}),
	);
	const { trigger: triggerJumpToBeat } = usePrompt(
		createJumpToBeatPrompt({
			render: ({ form }) => <form.AppField name="beatNum">{(ctx) => <ctx.NumberInput autoFocus label="Beat" placeholder="4" />}</form.AppField>,
			onSubmit: ({ value: { beatNum } }) => dispatch(jumpToBeat({ songId: sid, pauseTrack: true, beatNum: beatNum })),
		}),
	);

	return (
		<ActionPanelGroup.Root label="Actions">
			<HistoryActionPanelActionGroup />
			<ClipboardActionPanelActionGroup />
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
				{mappingExtensionsEnabled && (
					<Tooltip render={() => "Change the number of columns/rows"}>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={handleGridConfigClick}>
							Customize Grid
						</Button>
					</Tooltip>
				)}
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default DefaultActionPanelGroup;
