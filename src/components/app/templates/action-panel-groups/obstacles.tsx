import type { SongId } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Input, PromptDialogProvider } from "$/components/ui/compositions";
import { useUpdateAllSelectedObstaclesPrompt } from "../../hooks/prompts.hooks";

interface Props {
	sid: SongId;
}
function ObstaclesActionPanelGroup({ sid }: Props) {
	const { dialog: updatePrompt, handler: handleUpdate } = useUpdateAllSelectedObstaclesPrompt();

	return (
		<ActionPanelGroup.Root label="Obstacles">
			<ActionPanelGroup.ActionGroup>
				<PromptDialogProvider
					value={updatePrompt}
					title="Update Duration for Selected Obstacles"
					description={"Enter the new duration (in beats):"}
					placeholder="4"
					render={({ state, placeholder, setState }) => <Input value={state} placeholder={placeholder} onChange={(e) => e.preventDefault()} onValueChange={(details) => setState(details.valueAsString)} />}
					onSubmit={handleUpdate}
				>
					<Button variant="subtle" size="sm">
						Change duration
					</Button>
				</PromptDialogProvider>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default ObstaclesActionPanelGroup;
