import { resolveColorForItem } from "$/helpers/colors.helpers";
import { selectTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectEnvironment, selectNoteEditorTool } from "$/store/selectors";
import { ObjectTool, type SongId, View } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function NoteToolActionPanelGroup({ sid }: Props) {
	const dispatch = useAppDispatch();
	const environment = useAppSelector((state) => selectEnvironment(state, sid));
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const selectedTool = useAppSelector(selectNoteEditorTool);

	return (
		<ActionPanelGroup.Root label="Items">
			<ActionPanelGroup.ActionGroup>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.LEFT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.LEFT_NOTE }))}>
					<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.LEFT_NOTE, { environment, customColors })} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.RIGHT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.RIGHT_NOTE }))}>
					<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.RIGHT_NOTE, { environment, customColors })} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.BOMB_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.BOMB_NOTE }))}>
					<BombNoteIcon size={20} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.OBSTACLE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.OBSTACLE }))}>
					<ObstacleIcon size={20} color={resolveColorForItem(ObjectTool.OBSTACLE, { environment, customColors })} />
				</Button>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;
