import { Fragment, type MouseEventHandler } from "react";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { UNIT } from "$/constants";
import { promptJumpToBeat, promptQuickSelect } from "$/helpers/prompts.helpers";
import { jumpToBeat, pasteSelection, selectAllInRange } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectClipboardHasObjects, selectIsModuleEnabled } from "$/store/selectors";
import { View } from "$/types";
import { getMetaKeyLabel } from "$/utils";
import { ACTION_WIDTH } from "./EditorRightPanel.constants";

import Heading from "../Heading";
import MiniButton from "../MiniButton";
import Spacer from "../Spacer";
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
		<Wrapper>
			<Heading size={3}>Actions</Heading>
			<Spacer size={UNIT * 1.5} />

			<UndoRedo />

			<Spacer size={UNIT} />

			<Tooltip delay={1000} title={`Paste previously-copied notes (${getMetaKeyLabel(navigator)} + V)`}>
				<MiniButton disabled={!hasCopiedNotes} width={ACTION_WIDTH} onClick={() => dispatch(pasteSelection({ view: View.BEATMAP }))}>
					Paste Selection
				</MiniButton>
			</Tooltip>

			<Spacer size={UNIT} />

			<Tooltip delay={1000} title="Select everything over a time period (Q)">
				<MiniButton width={ACTION_WIDTH} onClick={() => dispatch(promptQuickSelect(View.BEATMAP, selectAllInRange))}>
					Quick-select
				</MiniButton>
			</Tooltip>

			<Spacer size={UNIT} />

			<Tooltip delay={1000} title="Jump to a specific beat number (J)">
				<MiniButton width={ACTION_WIDTH} onClick={() => dispatch(promptJumpToBeat(jumpToBeat, { pauseTrack: true }))}>
					Jump to Beat
				</MiniButton>
			</Tooltip>

			{mappingExtensionsEnabled && (
				<Fragment>
					<Spacer size={UNIT} />

					<Tooltip delay={500} title="Change the number of columns/rows">
						<MiniButton onClick={handleGridConfigClick}>Customize Grid</MiniButton>
					</Tooltip>
				</Fragment>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Actions;
