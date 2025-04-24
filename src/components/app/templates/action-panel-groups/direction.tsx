import { ArrowDownIcon, ArrowDownLeftIcon, ArrowDownRightIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowUpLeftIcon, ArrowUpRightIcon, CircleIcon } from "lucide-react";

import { selectNoteDirection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNoteEditorDirection, selectNoteEditorTool } from "$/store/selectors";
import { CutDirection, ObjectTool } from "$/types";

import { Grid } from "$:styled-system/jsx";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";

function NoteDirectionActionPanelGroup() {
	const dispatch = useAppDispatch();
	const selectedDirection = useAppSelector(selectNoteEditorDirection);
	const selectedNoteTool = useAppSelector(selectNoteEditorTool);

	const isDisabled = selectedNoteTool !== ObjectTool.LEFT_NOTE && selectedNoteTool !== ObjectTool.RIGHT_NOTE;

	return (
		<ActionPanelGroup.Root label="Notes">
			<Grid columns={3} gap={0.5}>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.UP_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP_LEFT }))}>
					<ArrowUpLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.UP} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP }))}>
					<ArrowUpIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.UP_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP_RIGHT }))}>
					<ArrowUpRightIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.LEFT }))}>
					<ArrowLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.ANY} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.ANY }))}>
					<CircleIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.RIGHT }))}>
					<ArrowRightIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.DOWN_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN_LEFT }))}>
					<ArrowDownLeftIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.DOWN} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN }))}>
					<ArrowDownIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isDisabled} data-active={selectedDirection === CutDirection.DOWN_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN_RIGHT }))}>
					<ArrowDownRightIcon />
				</Button>
			</Grid>
		</ActionPanelGroup.Root>
	);
}

export default NoteDirectionActionPanelGroup;
