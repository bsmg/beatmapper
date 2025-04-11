import { redoNotes, undoNotes } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";
import { getMetaKeyLabel } from "$/utils";

import { Wrap } from "$:styled-system/jsx";
import { Button, Tooltip } from "$/components/ui/compositions";

const UndoRedo = () => {
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);
	const dispatch = useAppDispatch();

	return (
		<Wrap gap={1}>
			<Tooltip render={() => `(${getMetaKeyLabel(navigator)} + Z)`}>
				<Button variant="subtle" size="sm" disabled={!canUndo} onClick={() => dispatch(undoNotes())}>
					Undo
				</Button>
			</Tooltip>
			<Tooltip render={() => `(Shift + ${getMetaKeyLabel(navigator)} + Z)`}>
				<Button variant="subtle" size="sm" disabled={!canRedo} onClick={() => dispatch(redoNotes())}>
					Redo
				</Button>
			</Tooltip>
		</Wrap>
	);
};

export default UndoRedo;
