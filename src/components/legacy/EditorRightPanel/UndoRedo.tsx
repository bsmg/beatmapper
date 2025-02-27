import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { redoNotes, undoNotes } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";
import { getMetaKeyLabel } from "$/utils";

import MiniButton from "../MiniButton";
import Spacer from "../Spacer";

const UndoRedo = () => {
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);
	const dispatch = useAppDispatch();

	return (
		<Row>
			<Tooltip delay={1000} title={`(${getMetaKeyLabel(navigator)} + Z)`}>
				<MiniButton width={token.var("sizes.actionPanelHalf")} disabled={!canUndo} onClick={() => dispatch(undoNotes())}>
					Undo
				</MiniButton>
			</Tooltip>
			<Spacer size={token.var("spacing.1")} />
			<Tooltip delay={1000} title={`(Shift + ${getMetaKeyLabel(navigator)} + Z)`}>
				<MiniButton width={token.var("sizes.actionPanelHalf")} disabled={!canRedo} onClick={() => dispatch(redoNotes())}>
					Redo
				</MiniButton>
			</Tooltip>
		</Row>
	);
};

const Row = styled.div`
  display: flex;
`;

export default UndoRedo;
