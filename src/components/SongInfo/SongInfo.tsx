import { Fragment, memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";
import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectActiveBeatmapId, selectBeatmapIds, selectSongById } from "$/store/selectors";
import type { SongId } from "$/types";

import CoverArtImage from "../CoverArtImage";
import CreateDifficultyForm from "../CreateDifficultyForm";
import Dropdown from "../Dropdown";
import Modal from "../Modal";
import Spacer from "../Spacer";

const COVER_ART_SIZES = {
	medium: 75,
	small: 50,
};

interface Props {
	songId: SongId;
	showDifficultySelector: boolean;
	coverArtSize?: "small" | "medium";
}

const SongInfo = ({ songId, showDifficultySelector, coverArtSize = "medium" }: Props) => {
	const selectedDifficulty = useAppSelector(selectActiveBeatmapId);
	const song = useAppSelector((state) => selectSongById(state, songId));
	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, songId));
	const navigate = useNavigate();

	const [showCreateDifficultyModal, setShowCreateDifficultyModal] = useState(false);

	return (
		<Fragment>
			<OuterWrapper>
				<Wrapper style={{ height: COVER_ART_SIZES[coverArtSize] }}>
					<CoverArtImage size={COVER_ART_SIZES[coverArtSize]} filename={song.coverArtFilename} />
					<Description>
						<Text>
							<Title>{song.name}</Title>
							<Spacer size={UNIT / 2} />
							<Subtitle>{song.artistName}</Subtitle>
						</Text>

						{showDifficultySelector && selectedDifficulty && (
							<Fragment>
								<Spacer size={UNIT} />
								<Dropdown
									label=""
									value={selectedDifficulty}
									onChange={(ev) => {
										ev.target.blur();

										const { value } = ev.target;

										if (value === "create-new") {
											setShowCreateDifficultyModal(true);
										} else {
											// TODO: Having the difficulty as part of the URL means that a bunch of state is reset when you change URLs, stuff like your position in the song.
											// This might be annoying when trying to jump quickly between two difficulties :/
											// Maybe I can solve this by pushing query strings?
											// ?offset=716.83
											navigate(`/edit/${song.id}/${value}/notes`);
										}
									}}
									width={90}
									height={28}
								>
									{difficultyIds.map((id) => (
										<option key={id} value={id} when-selected={getLabelForDifficulty(id)}>
											{getLabelForDifficulty(id)}
										</option>
									))}
									<option value="create-new" when-selected="--">
										+ Create new
									</option>
								</Dropdown>
							</Fragment>
						)}
					</Description>
				</Wrapper>
			</OuterWrapper>
			<Modal width={430} isVisible={showCreateDifficultyModal} clickBackdropToDismiss={true} onDismiss={() => setShowCreateDifficultyModal(false)}>
				<CreateDifficultyForm
					afterCreate={(difficulty) => {
						setShowCreateDifficultyModal(false);
						navigate(`/edit/${song.id}/${difficulty}/notes`);
					}}
				/>
			</Modal>
		</Fragment>
	);
};

const OuterWrapper = styled.div`
  position: absolute;
  z-index: 10;
  top: ${UNIT * 2}px;
  left: ${UNIT * 2}px;
  display: flex;
  align-items: center;
  user-select: none;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Text = styled.div`
  padding-left: ${UNIT}px;
`;

const Description = styled.div`
  padding-left: ${UNIT}px;
`;

const Title = styled.div`
  font-size: 21px;
  color: ${COLORS.gray[100]};
`;

const Subtitle = styled.div`
  font-size: 16px;
  color: ${COLORS.gray[300]};
`;

export default memo(SongInfo);
