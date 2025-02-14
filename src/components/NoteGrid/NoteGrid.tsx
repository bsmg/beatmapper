import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { arrowDownLeft } from "react-icons-kit/feather/arrowDownLeft";
import { arrowDownRight } from "react-icons-kit/feather/arrowDownRight";
import { arrowLeft } from "react-icons-kit/feather/arrowLeft";
import { arrowRight } from "react-icons-kit/feather/arrowRight";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowUpLeft } from "react-icons-kit/feather/arrowUpLeft";
import { arrowUpRight } from "react-icons-kit/feather/arrowUpRight";
import { circle } from "react-icons-kit/feather/circle";
import styled from "styled-components";

import { UNIT } from "$/constants";
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

			<Spacer size={UNIT * 1.5} />

			<Grid>
				<Row>
					<IconButton disabled={isDisabled} icon={arrowUpLeft} isToggled={selectedDirection === CutDirection.UP_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP_LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowUp} isToggled={selectedDirection === CutDirection.UP} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowUpRight} isToggled={selectedDirection === CutDirection.UP_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.UP_RIGHT }))} />
				</Row>
				<Spacer size={1} />
				<Row>
					<IconButton disabled={isDisabled} icon={arrowLeft} isToggled={selectedDirection === CutDirection.LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={circle} isToggled={selectedDirection === CutDirection.ANY} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.ANY }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowRight} isToggled={selectedDirection === CutDirection.RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.RIGHT }))} />
					<Spacer size={1} />
				</Row>
				<Spacer size={1} />
				<Row>
					<IconButton disabled={isDisabled} icon={arrowDownLeft} isToggled={selectedDirection === CutDirection.DOWN_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN_LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowDown} isToggled={selectedDirection === CutDirection.DOWN} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowDownRight} isToggled={selectedDirection === CutDirection.DOWN_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: CutDirection.DOWN_RIGHT }))} />
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
