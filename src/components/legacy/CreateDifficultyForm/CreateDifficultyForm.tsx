import { ListIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { createDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveBeatmapId, selectActiveSongId, selectBeatmapIds } from "$/store/selectors";
import { type BeatmapId, Difficulty } from "$/types";

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
				<Spacer size={token.var("spacing.4")} />
				<Paragraph>You already have a beatmap for every available difficulty. You cannot create any more beatmaps for this song.</Paragraph>
				<Paragraph>Did you mean to select an existing difficulty?</Paragraph>
			</Wrapper>
		);
	}
	return (
		<Wrapper>
			<Heading size={1}>Create new beatmap</Heading>
			<Spacer size={token.var("spacing.2")} />
			<Paragraph>
				Select the difficulty you'd like to start creating. You can also copy an existing difficulty instead, on the{" "}
				<Link to={"/edit/$sid/$bid/details"} params={{ sid: songId?.toString(), bid: currentDifficulty?.toString() }}>
					Song Details
				</Link>{" "}
				page (
				<IconWrapper>
					<ListIcon size={16} />
				</IconWrapper>
				).
			</Paragraph>
			<Spacer size={token.var("spacing.4")} />
			<DifficultiesWrapper>
				{Object.values(Difficulty).map((difficulty) => {
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
			<Spacer size={token.var("spacing.4")} />
			<Button style={{ width: 275, margin: "auto" }} onClick={() => songId && selectedId && dispatch(createDifficulty({ songId, difficulty: selectedId, afterCreate }))}>
				Create {selectedId && getLabelForDifficulty(selectedId)} beatmap
			</Button>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  padding: ${token.var("spacing.4")};
`;

const IconWrapper = styled.span`
  display: inline-block;
  padding-inline: 5px;
	transform: translateY(2px);
  color: rgba(255, 255, 255, 0.5);
`;

const DifficultiesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

export default CreateDifficultyForm;
