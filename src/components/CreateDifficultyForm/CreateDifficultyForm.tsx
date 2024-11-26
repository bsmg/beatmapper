import { Fragment, useState } from "react";
import { Icon } from "react-icons-kit";
import { sliders } from "react-icons-kit/feather/sliders";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { DIFFICULTIES, UNIT } from "$/constants";
import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { createDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveBeatmapId, selectActiveSongId, selectBeatmapIds } from "$/store/selectors";
import type { BeatmapId } from "$/types";

import Button from "../Button";
import DifficultyTag from "../DifficultyTag";
import Heading from "../Heading";
import Link from "../Link";
import Paragraph from "../Paragraph";
import Spacer from "../Spacer";

interface Props {
	afterCreate: (id: BeatmapId) => void;
}

const CreateDifficultyForm = ({ afterCreate }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const currentDifficulty = useAppSelector(selectActiveBeatmapId);
	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, songId));
	const dispatch = useAppDispatch();

	const [selectedId, setSelectedId] = useState<BeatmapId | null>(null);

	// If we already have all difficulties, let the user know
	if (difficultyIds.length === 5) {
		return (
			<Wrapper>
				<Heading size={1}>All beatmaps created</Heading>
				<Spacer size={UNIT * 4} />
				<Paragraph>You already have a beatmap for every available difficulty. You cannot create any more beatmaps for this song.</Paragraph>
				<Paragraph>Did you mean to select an existing difficulty?</Paragraph>
			</Wrapper>
		);
	}
	return (
		<Wrapper>
			<Heading size={1}>Create new beatmap</Heading>
			<Spacer size={UNIT * 2} />
			<Paragraph>
				Select the difficulty you'd like to start creating. You can also copy an existing difficulty instead, on the <Link to={`/edit/${songId}/${currentDifficulty}/details`}>Song Details</Link> page (
				<IconWrapper>
					<Icon icon={sliders} size={15} />
				</IconWrapper>
				).
			</Paragraph>
			<Spacer size={UNIT * 4} />
			<DifficultiesWrapper>
				{DIFFICULTIES.map((difficulty) => {
					const alreadyExists = difficultyIds.includes(difficulty);

					return (
						<Fragment key={difficulty}>
							{alreadyExists ? (
								<Tooltip title={difficulty === currentDifficulty ? `You're currently editing the ${currentDifficulty} beatmap` : "You already have a beatmap for this difficulty"}>
									<DifficultyTag disabled width={120} difficulty={difficulty} isSelected={selectedId === difficulty} onSelect={setSelectedId} />
								</Tooltip>
							) : (
								<DifficultyTag width={120} difficulty={difficulty} isSelected={selectedId === difficulty} onSelect={setSelectedId} />
							)}
							<br />
						</Fragment>
					);
				})}
			</DifficultiesWrapper>
			<Spacer size={UNIT * 4} />
			<Button style={{ width: 275, margin: "auto" }} onClick={() => songId && selectedId && dispatch(createDifficulty({ songId, difficulty: selectedId, afterCreate }))}>
				Create {selectedId && getLabelForDifficulty(selectedId)} beatmap
			</Button>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  padding: ${UNIT * 4}px;
`;

const IconWrapper = styled.span`
  display: inline-block;
  padding: 5px;
  color: rgba(255, 255, 255, 0.5);
`;

const DifficultiesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

export default CreateDifficultyForm;
