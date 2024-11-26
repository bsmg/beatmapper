import { Fragment } from "react";

import { UNIT } from "$/constants";
import { promptChangeObstacleDuration } from "$/helpers/prompts.helpers";
import { resizeSelectedObstacles, toggleFastWallsForSelectedObstacles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllSelectedObstacles, selectIsFastWallsEnabled } from "$/store/selectors";

import Heading from "../Heading";
import MiniButton from "../MiniButton";
import Spacer from "../Spacer";

const ObstacleTweaks = () => {
	const songId = useAppSelector(selectActiveSongId);
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);
	const enabledFastWalls = useAppSelector((state) => selectIsFastWallsEnabled(state, songId));
	const dispatch = useAppDispatch();

	return (
		<Fragment>
			<Heading size={3}>Selected Walls</Heading>
			<Spacer size={UNIT * 1.5} />
			<MiniButton onClick={() => dispatch(promptChangeObstacleDuration(selectedObstacles, resizeSelectedObstacles))}>Change duration</MiniButton>
			{enabledFastWalls && (
				<Fragment>
					<Spacer size={UNIT} />
					<MiniButton onClick={() => dispatch(toggleFastWallsForSelectedObstacles())}>Toggle Fast Walls</MiniButton>
				</Fragment>
			)}
		</Fragment>
	);
};

export default ObstacleTweaks;
