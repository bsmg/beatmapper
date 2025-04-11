import { getColorForItem } from "$/helpers/colors.helpers";
import { selectTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCustomColors, selectNoteEditorTool } from "$/store/selectors";
import { ObjectTool, View } from "$/types";

import { VStack, Wrap } from "$:styled-system/jsx";
import { Button, Heading } from "$/components/ui/compositions";
import BlockIcon from "./BlockIcon";
import MineIcon from "./MineIcon";
import ObstacleIcon from "./ObstacleIcon";

const ItemGrid = () => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const selectedTool = useAppSelector(selectNoteEditorTool);
	const dispatch = useAppDispatch();

	return (
		<VStack gap={1.5}>
			<Heading rank={3}>Items</Heading>
			<Wrap gap={0.5} justify={"center"}>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.LEFT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.LEFT_NOTE }))}>
					<BlockIcon color={getColorForItem(ObjectTool.LEFT_NOTE, customColors)} size={20} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.RIGHT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.RIGHT_NOTE }))}>
					<BlockIcon color={getColorForItem(ObjectTool.RIGHT_NOTE, customColors)} size={20} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.BOMB_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.BOMB_NOTE }))}>
					<MineIcon size={20} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.OBSTACLE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.OBSTACLE }))}>
					<ObstacleIcon size={20} />
				</Button>
			</Wrap>
		</VStack>
	);
};

export default ItemGrid;
