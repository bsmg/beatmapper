import { NoteDirection } from "bsmap";
import { ArrowDownIcon, ArrowDownLeftIcon, ArrowDownRightIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowUpLeftIcon, ArrowUpRightIcon, CircleIcon } from "lucide-react";
import { useMemo } from "react";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";
import { updateNotesEditorDirection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNotesEditorDirection, selectNotesEditorTool } from "$/store/selectors";
import { ObjectTool } from "$/types";
import { Grid } from "$:styled-system/jsx";

function NoteDirectionActionPanelGroup() {
	const dispatch = useAppDispatch();
	const selectedDirection = useAppSelector(selectNotesEditorDirection);
	const selectedNoteTool = useAppSelector(selectNotesEditorTool);

	const isDisabled = useMemo(() => selectedNoteTool !== ObjectTool.LEFT_NOTE && selectedNoteTool !== ObjectTool.RIGHT_NOTE, [selectedNoteTool]);

	return (
		<ActionPanelGroup.Root label="Notes">
			<Grid columns={3} gap={0.5}>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.UP_LEFT} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_LEFT }))}>
					<ArrowUpLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.UP} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP }))}>
					<ArrowUpIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.UP_RIGHT} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_RIGHT }))}>
					<ArrowUpRightIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.LEFT} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.LEFT }))}>
					<ArrowLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.ANY} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.ANY }))}>
					<CircleIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.RIGHT} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.RIGHT }))}>
					<ArrowRightIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.DOWN_LEFT} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_LEFT }))}>
					<ArrowDownLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.DOWN} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN }))}>
					<ArrowDownIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === NoteDirection.DOWN_RIGHT} onClick={() => dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_RIGHT }))}>
					<ArrowDownRightIcon />
				</Button>
			</Grid>
		</ActionPanelGroup.Root>
	);
}

export default NoteDirectionActionPanelGroup;
