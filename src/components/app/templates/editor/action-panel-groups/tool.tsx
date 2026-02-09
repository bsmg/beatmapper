import { useParams } from "@tanstack/react-router";

import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button, Tooltip } from "$/components/ui/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectNotesEditorTool } from "$/store/selectors";
import { ObjectTool } from "$/types";

function NoteToolActionPanelGroup() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectNotesEditorTool);

	return (
		<ActionPanelGroup.Root label="Items">
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Left Color Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.LEFT_NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.LEFT_NOTE }))}>
						<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.LEFT_NOTE, { colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Right Color Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.RIGHT_NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.RIGHT_NOTE }))}>
						<ColorNoteIcon size={20} color={resolveColorForItem(ObjectTool.RIGHT_NOTE, { colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Bomb Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.BOMB_NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.BOMB_NOTE }))}>
						<BombNoteIcon size={20} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Obstacle"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedTool === ObjectTool.OBSTACLE} unfocusOnPress onClick={() => dispatch(updateNotesEditorTool({ tool: ObjectTool.OBSTACLE }))}>
						<ObstacleIcon size={20} color={resolveColorForItem(ObjectTool.OBSTACLE, { colorScheme })} />
					</Button>
				</Tooltip>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;
