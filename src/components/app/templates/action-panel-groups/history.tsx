import { useParams } from "@tanstack/react-router";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";
import { redoObjects, undoObjects } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectObjectsCanRedo, selectObjectsCanUndo } from "$/store/selectors";

function HistoryActionPanelActionGroup() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const dispatch = useAppDispatch();
	const canUndo = useAppSelector(selectObjectsCanUndo);
	const canRedo = useAppSelector(selectObjectsCanRedo);

	return (
		<ActionPanelGroup.ActionGroup>
			<Button variant="subtle" size="sm" disabled={!canUndo} unfocusOnPress onClick={() => dispatch(undoObjects({ songId: sid }))}>
				Undo
			</Button>
			<Button variant="subtle" size="sm" disabled={!canRedo} unfocusOnPress onClick={() => dispatch(redoObjects({ songId: sid }))}>
				Redo
			</Button>
		</ActionPanelGroup.ActionGroup>
	);
}

export default HistoryActionPanelActionGroup;
