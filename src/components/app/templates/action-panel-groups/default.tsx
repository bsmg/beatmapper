import type { MouseEventHandler } from "react";

import { promptJumpToBeat, promptQuickSelect } from "$/helpers/prompts.helpers";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectModuleEnabled } from "$/store/selectors";
import { type SongId, View } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import ClipboardActionPanelActionGroup from "$/components/app/templates/action-panel-groups/clipboard";
import { Button, Tooltip } from "$/components/ui/compositions";
import HistoryActionPanelActionGroup from "./history";

interface Props {
	sid: SongId;
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanelGroup({ sid, handleGridConfigClick }: Props) {
	const dispatch = useAppDispatch();
	const mappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	return (
		<ActionPanelGroup.Root label="Actions">
			<HistoryActionPanelActionGroup sid={sid} />
			<ClipboardActionPanelActionGroup sid={sid} />
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Select everything over a time period"}>
					<Button variant="subtle" size="sm" onClick={() => dispatch(promptQuickSelect({ songId: sid, view: View.BEATMAP }))}>
						Quick-select
					</Button>
				</Tooltip>
				<Tooltip render={() => "Jump to a specific beat number"}>
					<Button variant="subtle" size="sm" onClick={() => dispatch(promptJumpToBeat({ songId: sid, pauseTrack: true }))}>
						Jump to Beat
					</Button>
				</Tooltip>
				{mappingExtensionsEnabled && (
					<Tooltip render={() => "Change the number of columns/rows"}>
						<Button variant="subtle" size="sm" onClick={handleGridConfigClick}>
							Customize Grid
						</Button>
					</Tooltip>
				)}
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default DefaultActionPanelGroup;
