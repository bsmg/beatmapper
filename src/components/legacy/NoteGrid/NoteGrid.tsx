import { ArrowDownIcon, ArrowDownLeftIcon, ArrowDownRightIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowUpLeftIcon, ArrowUpRightIcon, CircleIcon } from "lucide-react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { selectNoteDirection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNoteEditorDirection, selectNoteEditorTool } from "$/store/selectors";
import { CutDirection, ObjectTool } from "$/types";

import Heading from "../Heading";
import IconButton from "../IconButton";
import Spacer from "../Spacer";

const NoteGrid = () => {
	const selectedDirection = useAppSelector(selectNoteEditorDirection);
	const selectedNoteTool = useAppSelector(selectNoteEditorTool);
	const dispatch = useAppDispatch();

	const isDisabled = selectedNoteTool !== ObjectTool.LEFT_NOTE && selectedNoteTool !== ObjectTool.RIGHT_NOTE;

	return (
		<Wrapper>
			<Heading size={3}>Notes</Heading>

			<Spacer size={token.var("spacing.1.5")} />

			<Grid>
				<Row>
					<IconButton disabled={isDisabled} icon={ArrowUpLeftIcon} isToggled={selectedDirection === CutDirection.UP_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP_LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={ArrowUpIcon} isToggled={selectedDirection === CutDirection.UP} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={ArrowUpRightIcon} isToggled={selectedDirection === CutDirection.UP_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP_RIGHT }))} />
				</Row>
				<Spacer size={1} />
				<Row>
					<IconButton disabled={isDisabled} icon={ArrowLeftIcon} isToggled={selectedDirection === CutDirection.LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={CircleIcon} isToggled={selectedDirection === CutDirection.ANY} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.ANY }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={ArrowRightIcon} isToggled={selectedDirection === CutDirection.RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.RIGHT }))} />
					<Spacer size={1} />
				</Row>
				<Spacer size={1} />
				<Row>
					<IconButton disabled={isDisabled} icon={ArrowDownLeftIcon} isToggled={selectedDirection === CutDirection.DOWN_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN_LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={ArrowDownIcon} isToggled={selectedDirection === CutDirection.DOWN} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={ArrowDownRightIcon} isToggled={selectedDirection === CutDirection.DOWN_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN_RIGHT }))} />
					<Spacer size={1} />
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

export default NoteGrid;
