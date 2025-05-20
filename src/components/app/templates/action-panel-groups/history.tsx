import { redoNotes, undoNotes } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";
import type { SongId } from "$/types";
import { getMetaKeyLabel } from "$/utils";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Tooltip } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function HistoryActionPanelActionGroup({ sid }: Props) {
	const dispatch = useAppDispatch();
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);

	return (
		<ActionPanelGroup.ActionGroup>
			<Tooltip render={() => `(${getMetaKeyLabel(navigator)} + Z)`}>
				<Button variant="subtle" size="sm" disabled={!canUndo} onClick={() => dispatch(undoNotes({ songId: sid }))}>
					Undo
				</Button>
			</Tooltip>
			<Tooltip render={() => `(Shift + ${getMetaKeyLabel(navigator)} + Z)`}>
				<Button variant="subtle" size="sm" disabled={!canRedo} onClick={() => dispatch(redoNotes({ songId: sid }))}>
					Redo
				</Button>
			</Tooltip>
		</ActionPanelGroup.ActionGroup>
	);
}

export default HistoryActionPanelActionGroup;
