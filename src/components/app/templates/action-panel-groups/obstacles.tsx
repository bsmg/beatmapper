import { promptChangeObstacleDuration } from "$/helpers/prompts.helpers";
import { resizeSelectedObstacles, toggleFastWallsForSelectedObstacles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSelectedObstacles, selectIsFastWallsEnabled } from "$/store/selectors";
import type { SongId } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function ObstaclesActionPanelGroup({ sid }: Props) {
	const dispatch = useAppDispatch();
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);
	const enabledFastWalls = useAppSelector((state) => selectIsFastWallsEnabled(state, sid));

	return (
		<ActionPanelGroup.Root label="Obstacles">
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" onClick={() => dispatch(promptChangeObstacleDuration(resizeSelectedObstacles, selectedObstacles, {}))}>
					Change duration
				</Button>
				{enabledFastWalls && (
					<Button variant="subtle" size="sm" onClick={() => dispatch(toggleFastWallsForSelectedObstacles())}>
						Toggle Fast Walls
					</Button>
				)}
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default ObstaclesActionPanelGroup;
