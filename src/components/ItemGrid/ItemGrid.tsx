import styled from "styled-components";

import { UNIT } from "$/constants";
import { getColorForItem } from "$/helpers/colors.helpers";
import { selectTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getSelectedNoteTool, selectActiveSongId, selectCustomColors } from "$/store/selectors";
import { ObjectTool, View } from "$/types";

import Heading from "../Heading";
import IconButton from "../IconButton";
import Spacer from "../Spacer";
import BlockIcon from "./BlockIcon";
import MineIcon from "./MineIcon";
import ObstacleIcon from "./ObstacleIcon";

const ItemGrid = () => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const selectedTool = useAppSelector(getSelectedNoteTool);
	const dispatch = useAppDispatch();

	const buttonSize = 36;
	return (
		<Wrapper>
			<Heading size={3}>Items</Heading>

			<Spacer size={UNIT * 1.5} />

			<Grid>
				<Row>
					<IconButton size={buttonSize} isToggled={selectedTool === ObjectTool.LEFT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.LEFT_NOTE }))}>
						<BlockIcon color={getColorForItem(ObjectTool.LEFT_NOTE, customColors)} />
					</IconButton>
					<Spacer size={1} />
					<IconButton size={buttonSize} isToggled={selectedTool === ObjectTool.RIGHT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.RIGHT_NOTE }))}>
						<BlockIcon color={getColorForItem(ObjectTool.RIGHT_NOTE, customColors)} />
					</IconButton>
					<Spacer size={1} />
					<IconButton size={buttonSize} isToggled={selectedTool === ObjectTool.BOMB_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.BOMB_NOTE }))}>
						<MineIcon size={20} />
					</IconButton>
					<Spacer size={1} />
					<IconButton size={buttonSize} isToggled={selectedTool === ObjectTool.OBSTACLE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.OBSTACLE }))}>
						<ObstacleIcon size={20} />
					</IconButton>
				</Row>
			</Grid>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Grid = styled.div``;

const Row = styled.div`
  display: flex;
`;

export default ItemGrid;
