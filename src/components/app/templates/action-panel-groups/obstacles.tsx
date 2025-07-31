import type { SongId } from "$/types";

import { useAppPrompterContext } from "$/components/app/compositions";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function ObstaclesActionPanelGroup({ sid }: Props) {
	const { openPrompt } = useAppPrompterContext();

	return (
		<ActionPanelGroup.Root label="Obstacles">
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" onClick={() => openPrompt("UPDATE_OBSTACLE_DURATION")}>
					Change duration
				</Button>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default ObstaclesActionPanelGroup;
