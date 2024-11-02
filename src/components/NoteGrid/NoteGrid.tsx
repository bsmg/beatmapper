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
import { getSelectedCutDirection, getSelectedNoteTool } from "$/store/selectors";
import { Direction, ObjectTool } from "$/types";

import Heading from "../Heading";
import IconButton from "../IconButton";
import Spacer from "../Spacer";

const NoteGrid = () => {
	const selectedDirection = useAppSelector(getSelectedCutDirection);
	const selectedNoteTool = useAppSelector(getSelectedNoteTool);
	const dispatch = useAppDispatch();

	const isDisabled = selectedNoteTool !== ObjectTool.LEFT_NOTE && selectedNoteTool !== ObjectTool.RIGHT_NOTE;

	return (
		<Wrapper>
			<Heading size={3}>Notes</Heading>

			<Spacer size={UNIT * 1.5} />

			<Grid>
				<Row>
					<IconButton disabled={isDisabled} icon={arrowUpLeft} isToggled={selectedDirection === Direction.UP_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: Direction.UP_LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowUp} isToggled={selectedDirection === Direction.UP} onClick={() => dispatch(selectNoteDirection({ direction: Direction.UP }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowUpRight} isToggled={selectedDirection === Direction.UP_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: Direction.UP_RIGHT }))} />
				</Row>
				<Spacer size={1} />
				<Row>
					<IconButton disabled={isDisabled} icon={arrowLeft} isToggled={selectedDirection === Direction.LEFT} onClick={() => dispatch(selectNoteDirection({ direction: Direction.LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={circle} isToggled={selectedDirection === Direction.ANY} onClick={() => dispatch(selectNoteDirection({ direction: Direction.ANY }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowRight} isToggled={selectedDirection === Direction.RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: Direction.RIGHT }))} />
					<Spacer size={1} />
				</Row>
				<Spacer size={1} />
				<Row>
					<IconButton disabled={isDisabled} icon={arrowDownLeft} isToggled={selectedDirection === Direction.DOWN_LEFT} onClick={() => dispatch(selectNoteDirection({ direction: Direction.DOWN_LEFT }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowDown} isToggled={selectedDirection === Direction.DOWN} onClick={() => dispatch(selectNoteDirection({ direction: Direction.DOWN }))} />
					<Spacer size={1} />
					<IconButton disabled={isDisabled} icon={arrowDownRight} isToggled={selectedDirection === Direction.DOWN_RIGHT} onClick={() => dispatch(selectNoteDirection({ direction: Direction.DOWN_RIGHT }))} />
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
