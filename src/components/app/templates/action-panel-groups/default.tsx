import type { MouseEventHandler } from "react";

import { promptJumpToBeat, promptQuickSelect } from "$/helpers/prompts.helpers";
import { jumpToBeat, selectAllInRange } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectIsModuleEnabled } from "$/store/selectors";
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
	const mappingExtensionsEnabled = useAppSelector((state) => selectIsModuleEnabled(state, sid, "mappingExtensions"));

	return (
		<ActionPanelGroup.Root label="Actions">
			<HistoryActionPanelActionGroup sid={sid} />
			<ClipboardActionPanelActionGroup sid={sid} />
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Select everything over a time period (Q)"}>
					<Button variant="subtle" size="sm" onClick={() => dispatch(promptQuickSelect(selectAllInRange, { songId: sid, view: View.BEATMAP }))}>
						Quick-select
					</Button>
				</Tooltip>
				<Tooltip render={() => "Jump to a specific beat number (J)"}>
					<Button variant="subtle" size="sm" onClick={() => dispatch(promptJumpToBeat(jumpToBeat, { songId: sid, pauseTrack: true }))}>
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
