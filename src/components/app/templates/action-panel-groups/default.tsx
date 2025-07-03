import type { MouseEventHandler } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectModuleEnabled } from "$/store/selectors";
import type { SongId } from "$/types";
import { useJumpToBeatPrompt, useQuickSelectPrompt } from "../../hooks/prompts.hooks";

import { ActionPanelGroup } from "$/components/app/layouts";
import ClipboardActionPanelActionGroup from "$/components/app/templates/action-panel-groups/clipboard";
import { Button, Input, PromptDialogProvider, Tooltip } from "$/components/ui/compositions";
import HistoryActionPanelActionGroup from "./history";

interface Props {
	sid: SongId;
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanelGroup({ sid, handleGridConfigClick }: Props) {
	const mappingExtensionsEnabled = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const { dialog: quickSelectPrompt, handler: handleQuickSelect } = useQuickSelectPrompt({ songId: sid });
	const { dialog: jumpToBeatPrompt, handler: handleJumpToBeat } = useJumpToBeatPrompt({ songId: sid });

	return (
		<ActionPanelGroup.Root label="Actions">
			<HistoryActionPanelActionGroup sid={sid} />
			<ClipboardActionPanelActionGroup sid={sid} />
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Select everything over a time period"}>
					<PromptDialogProvider
						value={quickSelectPrompt}
						title="Quick-select"
						description="Quick-select all entities in a given range of beats:"
						placeholder="16-32"
						render={({ state, placeholder, setState }) => <Input value={state} placeholder={placeholder} onChange={(e) => e.preventDefault()} onValueChange={(details) => setState(details.valueAsString)} />}
						onSubmit={handleQuickSelect}
					>
						<Button variant="subtle" size="sm">
							Quick-select
						</Button>
					</PromptDialogProvider>
				</Tooltip>
				<Tooltip render={() => "Jump to a specific beat number"}>
					<PromptDialogProvider
						value={jumpToBeatPrompt}
						title="Jump to Beat"
						description="Enter the beat number you wish to jump to:"
						placeholder="8"
						render={({ state, placeholder, setState }) => <Input value={state} placeholder={placeholder} onChange={(e) => e.preventDefault()} onValueChange={(details) => setState(details.valueAsString)} />}
						onSubmit={handleJumpToBeat}
					>
						<Button variant="subtle" size="sm">
							Jump to Beat
						</Button>
					</PromptDialogProvider>
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
