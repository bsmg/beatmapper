import type { MouseEventHandler } from "react";

import { promptJumpToBeat, promptQuickSelect } from "$/helpers/prompts.helpers";
import { jumpToBeat, pasteSelection, selectAllInRange } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectClipboardHasObjects, selectIsModuleEnabled } from "$/store/selectors";
import { View } from "$/types";
import { getMetaKeyLabel } from "$/utils";

import { VStack } from "$:styled-system/jsx";
import { Button, Heading, Tooltip } from "$/components/ui/compositions";
import UndoRedo from "./UndoRedo";

interface Props {
	handleGridConfigClick: MouseEventHandler;
}

const Actions = ({ handleGridConfigClick }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const hasCopiedNotes = useAppSelector(selectClipboardHasObjects);
	const mappingExtensionsEnabled = useAppSelector((state) => selectIsModuleEnabled(state, songId, "mappingExtensions"));
	const dispatch = useAppDispatch();

	return (
		<VStack gap={1.5}>
			<Heading rank={3}>Actions</Heading>
			<VStack gap={1}>
				<UndoRedo />
				<Tooltip render={() => `Paste previously-copied notes (${getMetaKeyLabel(navigator)} + V)`}>
					<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} onClick={() => dispatch(pasteSelection({ view: View.BEATMAP }))}>
						Paste Selection
					</Button>
				</Tooltip>
				<Tooltip render={() => "Select everything over a time period (Q)"}>
					<Button variant="subtle" size="sm" onClick={() => dispatch(promptQuickSelect(View.BEATMAP, selectAllInRange))}>
						Quick-select
					</Button>
				</Tooltip>
				<Tooltip render={() => "Jump to a specific beat number (J)"}>
					<Button variant="subtle" size="sm" onClick={() => dispatch(promptJumpToBeat(jumpToBeat, { pauseTrack: true }))}>
						Jump to Beat
					</Button>
				</Tooltip>
				{mappingExtensionsEnabled && (
					<Tooltip render={() => "Change the number of columns/rows"}>
						<Button variant="subtle" size="sm" onClick={handleGridConfigClick}>
							Customize Grid
						</Button>
					</Tooltip>
				)}
			</VStack>
		</VStack>
	);
};

export default Actions;
