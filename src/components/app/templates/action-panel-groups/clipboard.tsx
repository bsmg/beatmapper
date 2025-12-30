import { Presence } from "@ark-ui/react/presence";
import { useParams, useRouteContext } from "@tanstack/react-router";

import { ActionPanelGroup } from "$/components/app/layouts";
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
			<Presence asChild present={isAnythingSelected}>
				<ActionPanelGroup.ActionGroup>
					<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnClick onClick={() => dispatch(cutSelection({ view }))}>
						Cut
					</Button>
					<Button variant="subtle" size="sm" disabled={!isAnythingSelected} unfocusOnClick onClick={() => dispatch(copySelection({ view }))}>
						Copy
					</Button>
				</ActionPanelGroup.ActionGroup>
			</Presence>
			<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} unfocusOnClick onClick={() => dispatch(pasteSelection({ songId: sid, view }))}>
				Paste Selection
			</Button>
		</ActionPanelGroup.ActionGroup>
	);
}

export default ClipboardActionPanelActionGroup;
