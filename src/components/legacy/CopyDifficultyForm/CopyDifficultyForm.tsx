// TODO: Possibly dedupe with CreateDifficultyForm?
import { Fragment, useState } from "react";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectBeatmapIds } from "$/store/selectors";
import { type BeatmapId, Difficulty, type SongId } from "$/types";

import Button from "../Button";
import DifficultyTag from "../DifficultyTag";
import Heading from "../Heading";
import Paragraph from "../Paragraph";
import Spacer from "../Spacer";

interface Props {
	songId: SongId;
	idToCopy: BeatmapId;
	afterCopy: (id: BeatmapId) => void;
	copyDifficulty: (songId: SongId, fromDifficultyId: BeatmapId, toDifficultyId: BeatmapId, afterCopy: (id: BeatmapId) => void) => void;
}

const CopyDifficultyForm = ({ songId, idToCopy, afterCopy, copyDifficulty }: Props) => {
	const DIFFICULTIES = Object.values(Difficulty);
	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, songId));
	const [selectedId, setSelectedId] = useState<BeatmapId | null>(null);

	// If we already have all difficulties, let the user know
	if (difficultyIds.length === DIFFICULTIES.length) {
		return (
			<Wrapper>
				<Heading size={1}>All beatmaps created</Heading>
				<Spacer size={token.var("spacing.4")} />
				<Paragraph>You already have beatmaps for every difficulty, and you can only copy beatmaps for difficulties that don't yet exist. Please delete the beatmap for the difficulty you'd like to copy to.</Paragraph>
			</Wrapper>
		);
	}

	// Don't render the one we're copying.
	// Eg. if the user wants to copy Ex+ to Ex, don't show the Ex+ in the list of options to copy to.
	const difficultiesToRender = DIFFICULTIES.filter((d) => d !== idToCopy);

	return (
		<Wrapper>
			<Heading size={1}>Copy beatmap </Heading>
			<Spacer size={token.var("spacing.2")} />
			<Paragraph>
				Copy the <Highlight>{getLabelForDifficulty(idToCopy)}</Highlight> beatmap for another difficulty:
			</Paragraph>
			<Spacer size={token.var("spacing.4")} />
			<DifficultiesWrapper>
				{difficultiesToRender.map((difficulty) => {
					const alreadyExists = difficultyIds.includes(difficulty);

					return (
						<Fragment key={difficulty}>
							{alreadyExists ? (
								<Tooltip title="You already have a beatmap for this difficulty">
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
			{selectedId && (
				<Button
					style={{ width: 275, margin: "auto" }}
					onClick={() => {
						copyDifficulty(songId, idToCopy, selectedId, afterCopy);
					}}
				>
					Copy beatmap
				</Button>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  padding: ${token.var("spacing.4")};
  text-align: center;
`;

const Highlight = styled.span`
  color: ${token.var("colors.yellow.500")};
  font-weight: 500;
`;

const DifficultiesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

export default CopyDifficultyForm;
