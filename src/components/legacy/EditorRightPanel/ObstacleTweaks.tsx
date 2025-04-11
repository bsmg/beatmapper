import { promptChangeObstacleDuration } from "$/helpers/prompts.helpers";
import { resizeSelectedObstacles, toggleFastWallsForSelectedObstacles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllSelectedObstacles, selectIsFastWallsEnabled } from "$/store/selectors";

import { VStack, Wrap } from "$:styled-system/jsx";
import { Button, Heading } from "$/components/ui/compositions";

const ObstacleTweaks = () => {
	const songId = useAppSelector(selectActiveSongId);
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);
	const enabledFastWalls = useAppSelector((state) => selectIsFastWallsEnabled(state, songId));
	const dispatch = useAppDispatch();

	return (
		<VStack gap={1.5}>
			<Heading rank={3}>Selected Walls</Heading>
			<Wrap gap={1}>
				<Button variant="subtle" size="sm" onClick={() => dispatch(promptChangeObstacleDuration(selectedObstacles, resizeSelectedObstacles))}>
					Change duration
				</Button>
				{enabledFastWalls && (
					<Button variant="subtle" size="sm" onClick={() => dispatch(toggleFastWallsForSelectedObstacles())}>
						Toggle Fast Walls
					</Button>
				)}
			</Wrap>
		</VStack>
	);
};

export default ObstacleTweaks;
