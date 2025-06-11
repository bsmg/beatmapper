import { promptChangeObstacleDuration } from "$/helpers/prompts.helpers";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSelectedObstacles } from "$/store/selectors";
import type { SongId } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function ObstaclesActionPanelGroup({ sid }: Props) {
	const dispatch = useAppDispatch();
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);

	return (
		<ActionPanelGroup.Root label="Obstacles">
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" onClick={() => dispatch(promptChangeObstacleDuration(selectedObstacles))}>
					Change duration
				</Button>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default ObstaclesActionPanelGroup;
