import { type ComponentProps, type MouseEventHandler, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";
import { renderImperativePrompt } from "$/helpers/modal.helpers";
import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { copyDifficulty, deleteBeatmap, updateBeatmapMetadata } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import CopyDifficultyForm from "../CopyDifficultyForm";
import Heading from "../Heading";
import MiniButton from "../MiniButton";
import type Modal from "../Modal";
import Spacer from "../Spacer";
import TextInput from "../TextInput";

interface Props {
	songId: SongId;
	difficultyId: BeatmapId;
}

const BeatmapSettings = ({ songId, difficultyId }: Props) => {
	const song = useAppSelector((state) => selectSongById(state, songId));
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const savedVersion = song.difficultiesById[difficultyId];

	const [noteJumpSpeed, setNoteJumpSpeed] = useState(savedVersion.noteJumpSpeed);
	const [startBeatOffset, setStartBeatOffset] = useState(savedVersion.startBeatOffset);

	const [customLabel, setCustomLabel] = useState(savedVersion.customLabel);

	const isDirty = Number(noteJumpSpeed) !== savedVersion.noteJumpSpeed || Number(startBeatOffset) !== savedVersion.startBeatOffset || customLabel !== savedVersion.customLabel;

	const handleCopyBeatmap: MouseEventHandler = (ev) => {
		ev.preventDefault();

		const modalProps: ComponentProps<typeof Modal> = { width: 400, alignment: "top" };

		renderImperativePrompt(modalProps, (triggerSuccess, triggerClose) => (
			<CopyDifficultyForm songId={songId} idToCopy={difficultyId} afterCopy={(id) => (id ? triggerSuccess(id) : triggerClose())} copyDifficulty={(songId, fromDifficultyId, toDifficultyId, afterCopy) => dispatch(copyDifficulty({ songId, fromDifficultyId, toDifficultyId, afterCopy }))} />
		)).then((copiedToDifficultyId) => {
			// Redirect the user to this new difficulty, so that when they go to edit it, they're editing the right difficulty.
			if (copiedToDifficultyId) navigate(`/edit/${songId}/${copiedToDifficultyId}/details`);
		});
	};

	const handleDeleteBeatmap: MouseEventHandler = (ev) => {
		ev.preventDefault();

		const confirmed = window.confirm("Are you sure you want to do this? This action cannot be undone.");

		if (!confirmed) {
			return;
		}

		// Delete our working state
		const mutableDifficultiesCopy = { ...song.difficultiesById };
		delete mutableDifficultiesCopy[difficultyId];

		// Don't let the user delete the last difficulty!
		const remainingDifficultyIds = Object.keys(mutableDifficultiesCopy);
		if (remainingDifficultyIds.length === 0) {
			alert("Sorry, you cannot delete the only remaining difficulty! Please create another difficulty first.");
			return;
		}

		// If the user is currently editing the difficulty that they're trying to delete, let's redirect them to the next difficulty.
		const nextDifficultyId = remainingDifficultyIds[0];

		dispatch(deleteBeatmap({ songId: songId, difficulty: difficultyId }));

		navigate(`/edit/${songId}/${nextDifficultyId}/details`);
	};

	const handleSaveBeatmap: MouseEventHandler = (ev) => {
		// Validate that both values are valid numbers.
		if (Number.isNaN(noteJumpSpeed)) {
			window.alert("Note jump speed needs to be a number");
		} else if (Number.isNaN(startBeatOffset)) {
			window.alert("Start beat offset needs to be a number");
		}

		dispatch(updateBeatmapMetadata({ songId: songId, difficulty: difficultyId, noteJumpSpeed: Number(noteJumpSpeed), startBeatOffset: Number(startBeatOffset), customLabel }));
	};

	const difficultyLabel = getLabelForDifficulty(difficultyId);

	useBlocker(() => (isDirty ? !window.confirm(`You have unsaved changes! Are you sure you want to leave this page?\n\n(You tweaked a value for the ${difficultyLabel} beatmap)`) : false));

	return (
		<Wrapper>
			<Heading size={3}>{difficultyLabel}</Heading>
			<Spacer size={UNIT * 3} />
			<TextInput label="Note jump speed" value={noteJumpSpeed} onChange={(ev) => setNoteJumpSpeed(Number(ev.target.value))} />
			<Spacer size={UNIT * 3} />
			<TextInput label="Start beat offset" value={startBeatOffset} onChange={(ev) => setStartBeatOffset(Number(ev.target.value))} />
			<Spacer size={UNIT * 3} />
			<TextInput label="Custom label" value={customLabel || ""} onChange={(ev) => setCustomLabel(ev.target.value)} />
			<Spacer size={UNIT * 3} />

			<Row>
				<MiniButton disabled={!isDirty} onClick={handleSaveBeatmap}>
					Save
				</MiniButton>
				<Spacer size={UNIT * 2} />
				<MiniButton onClick={handleCopyBeatmap}>Copy</MiniButton>
				<Spacer size={UNIT * 2} />
				<MiniButton color={COLORS.red[700]} hoverColor={COLORS.red[500]} onClick={handleDeleteBeatmap}>
					Delete
				</MiniButton>
			</Row>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: ${UNIT * 3}px;
  margin: ${UNIT * 2}px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
`;

export default BeatmapSettings;
