import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";
import { redoObjects, undoObjects } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";
import type { SongId } from "$/types";

interface Props {
	sid: SongId;
}
function HistoryActionPanelActionGroup({ sid }: Props) {
	const dispatch = useAppDispatch();
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);

	return (
		<ActionPanelGroup.ActionGroup>
			<Button variant="subtle" size="sm" disabled={!canUndo} onClick={() => dispatch(undoObjects({ songId: sid }))}>
				Undo
			</Button>
			<Button variant="subtle" size="sm" disabled={!canRedo} onClick={() => dispatch(redoObjects({ songId: sid }))}>
				Redo
			</Button>
		</ActionPanelGroup.ActionGroup>
	);
}

export default HistoryActionPanelActionGroup;
