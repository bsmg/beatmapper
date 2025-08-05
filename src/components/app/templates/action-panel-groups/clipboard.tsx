import { Presence } from "@ark-ui/react/presence";
import { createSelector } from "@reduxjs/toolkit";

import { useViewFromLocation } from "$/components/app/hooks";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Button } from "$/components/ui/compositions";
import { copySelection, cutSelection, pasteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSelectedObjects, selectClipboardHasObjects } from "$/store/selectors";
import { type SongId, View } from "$/types";

interface Props {
	sid: SongId;
}
function ClipboardActionPanelActionGroup({ sid }: Props) {
	const dispatch = useAppDispatch();
	const view = useViewFromLocation();
	const isAnythingSelected = useAppSelector(createSelector(selectAllSelectedObjects, (state) => [...(state.notes ?? []), ...(state.bombs ?? []), ...(state.obstacles ?? [])].length > 0));
	const hasCopiedNotes = useAppSelector(selectClipboardHasObjects);

	return (
		<ActionPanelGroup.ActionGroup>
			<Presence asChild present={isAnythingSelected}>
				<ActionPanelGroup.ActionGroup>
					<Button variant="subtle" size="sm" disabled={!isAnythingSelected} onClick={() => dispatch(cutSelection({ view: view ?? View.BEATMAP }))}>
						Cut
					</Button>
					<Button variant="subtle" size="sm" disabled={!isAnythingSelected} onClick={() => dispatch(copySelection({ view: view ?? View.BEATMAP }))}>
						Copy
					</Button>
				</ActionPanelGroup.ActionGroup>
			</Presence>
			<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} onClick={() => dispatch(pasteSelection({ songId: sid, view: view ?? View.BEATMAP }))}>
				Paste Selection
			</Button>
		</ActionPanelGroup.ActionGroup>
	);
}

export default ClipboardActionPanelActionGroup;
