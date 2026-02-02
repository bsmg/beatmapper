import { useParams, useRouteContext } from "@tanstack/react-router";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { Button } from "$/components/ui/compositions";
import { copySelection, cutSelection, pasteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAnySelectedObjects, selectClipboardHasObjects } from "$/store/selectors";

function ClipboardActionPanelActionGroup() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isAnythingSelected = useAppSelector(selectAnySelectedObjects);
	const hasCopiedNotes = useAppSelector(selectClipboardHasObjects);

	return (
		<ActionPanelGroup.ActionGroup>
			<Show when={isAnythingSelected}>
				<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnPress onClick={() => dispatch(cutSelection({ view }))}>
					Cut
				</Button>
				<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnPress onClick={() => dispatch(copySelection({ view }))}>
					Copy
				</Button>
			</Show>
			<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} unfocusOnPress onClick={() => dispatch(pasteSelection({ songId: sid, view }))}>
				Paste Selection
			</Button>
		</ActionPanelGroup.ActionGroup>
	);
}

export default ClipboardActionPanelActionGroup;
