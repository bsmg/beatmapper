import { Presence } from "@ark-ui/react/presence";
import { createSelector } from "@reduxjs/toolkit";

import { copySelection, cutSelection, pasteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSelectedObjects, selectClipboardHasObjects } from "$/store/selectors";
import { type SongId, View } from "$/types";
import { getMetaKeyLabel } from "$/utils";

import { useViewFromLocation } from "$/components/app/hooks";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Tooltip } from "$/components/ui/compositions";

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
					<Tooltip render={() => `Copy and remove selection (${getMetaKeyLabel()} + X)`}>
						<Button variant="subtle" size="sm" disabled={!isAnythingSelected} onClick={() => dispatch(cutSelection({ view: view ?? View.BEATMAP }))}>
							Cut
						</Button>
					</Tooltip>
					<Tooltip render={() => `Copy selection (${getMetaKeyLabel()} + C)`}>
						<Button variant="subtle" size="sm" disabled={!isAnythingSelected} onClick={() => dispatch(copySelection({ view: view ?? View.BEATMAP }))}>
							Copy
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
			</Presence>
			<Tooltip render={() => `Paste copied notes and obstacles (${getMetaKeyLabel()} + V)`}>
				<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} onClick={() => dispatch(pasteSelection({ songId: sid, view: view ?? View.BEATMAP }))}>
					Paste Selection
				</Button>
			</Tooltip>
		</ActionPanelGroup.ActionGroup>
	);
}

export default ClipboardActionPanelActionGroup;
