import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button, Tooltip } from "$/components/ui/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectNotesEditorTool } from "$/store/selectors";
import { type BeatmapId, ObjectTool, type SongId } from "$/types";

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function NoteToolActionPanelGroup({ sid, bid }: Props) {
	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);

	return (
		<ActionPanelGroup.Root label="Items">
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Left Color Note"}>
					<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.LEFT_NOTE} onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.LEFT_NOTE }))}>
						<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.LEFT_NOTE, { customColors: colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Right Color Note"}>
					<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.RIGHT_NOTE} onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.RIGHT_NOTE }))}>
						<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.RIGHT_NOTE, { customColors: colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Bomb Note"}>
					<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.BOMB_NOTE} onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.BOMB_NOTE }))}>
						<BombNoteIcon size={20} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Obstacle"}>
					<Button variant="ghost" size="icon" data-active={selectedTool === ObjectTool.OBSTACLE} onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.OBSTACLE }))}>
						<ObstacleIcon size={20} color={resolveColorForItem(ObjectTool.OBSTACLE, { customColors: colorScheme })} />
					</Button>
				</Tooltip>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;
