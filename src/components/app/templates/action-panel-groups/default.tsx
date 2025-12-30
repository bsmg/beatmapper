import { useParams } from "@tanstack/react-router";
import type { MouseEventHandler } from "react";

import { useAppPrompterContext } from "$/components/app/compositions";
import { ActionPanelGroup } from "$/components/app/layouts";
import ClipboardActionPanelActionGroup from "$/components/app/templates/action-panel-groups/clipboard";
import { Button, Tooltip } from "$/components/ui/compositions";
import { useAppSelector } from "$/store/hooks";
import { selectModuleEnabled } from "$/store/selectors";
import HistoryActionPanelActionGroup from "./history";

interface Props {
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanelGroup({ handleGridConfigClick }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const mappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const { openPrompt } = useAppPrompterContext();

	return (
		<ActionPanelGroup.Root label="Actions">
			<HistoryActionPanelActionGroup />
			<ClipboardActionPanelActionGroup />
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Select everything over a time period"}>
					<Button variant="subtle" size="sm" unfocusOnClick onClick={() => openPrompt("QUICK_SELECT")}>
						Quick-select
					</Button>
				</Tooltip>
				<Tooltip render={() => "Jump to a specific beat number"}>
					<Button variant="subtle" size="sm" unfocusOnClick onClick={() => openPrompt("JUMP_TO_BEAT")}>
						Jump to Beat
					</Button>
				</Tooltip>
				{mappingExtensionsEnabled && (
					<Tooltip render={() => "Change the number of columns/rows"}>
						<Button variant="subtle" size="sm" unfocusOnClick onClick={handleGridConfigClick}>
							Customize Grid
						</Button>
					</Tooltip>
				)}
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default DefaultActionPanelGroup;
