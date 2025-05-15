import { resolveColorForItem } from "$/helpers/colors.helpers";
import { selectTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectNoteEditorTool } from "$/store/selectors";
import { type BeatmapId, ObjectTool, type SongId, View } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function NoteToolActionPanelGroup({ sid, bid }: Props) {
	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNoteEditorTool);

	return (
		<ActionPanelGroup.Root label="Items">
			<ActionPanelGroup.ActionGroup>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.LEFT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.LEFT_NOTE }))}>
					<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.LEFT_NOTE, { customColors: colorScheme })} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.RIGHT_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.RIGHT_NOTE }))}>
					<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.RIGHT_NOTE, { customColors: colorScheme })} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.BOMB_NOTE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.BOMB_NOTE }))}>
					<BombNoteIcon size={20} />
				</Button>
				<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.OBSTACLE} onClick={() => dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.OBSTACLE }))}>
					<ObstacleIcon size={20} color={resolveColorForItem(ObjectTool.OBSTACLE, { customColors: colorScheme })} />
				</Button>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;
