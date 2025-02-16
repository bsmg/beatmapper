import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { COLORS, DIFFICULTY_COLORS, DIFFICULTY_RENAME, UNIT } from "$/constants";
import { changeSelectedDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import { Difficulty, type SongId } from "$/types";

import CoverArtImage from "../CoverArtImage";
import MiniButton from "../MiniButton";
import Spacer from "../Spacer";
import UnstyledButton from "../UnstyledButton";
import SongRowActions from "./SongRowActions";

const SQUARE_SIZE = 12;
const SQUARE_PADDING = 4;
const CELL_HEIGHT = 40;

interface Props {
	songId: SongId;
}

const SongsTableRow = ({ songId }: Props) => {
	const song = useAppSelector((state) => selectSongById(state, songId));
	const dispatch = useAppDispatch();

	const difficultyToLoad = song.selectedDifficulty || Object.keys(song.difficultiesById)[0];

	return (
		<tr>
			<CoverArtCell>
				<CoverArtImage filename={song.coverArtFilename} size={CELL_HEIGHT} />
			</CoverArtCell>
			<DescriptionCell>
				<Title>
					{song.name}
					{song.demo && <Demo>(Demo song)</Demo>}
				</Title>
				<Spacer size={6} />
				<Artist>{song.artistName}</Artist>
			</DescriptionCell>
			<DifficultySquaresCell>
				<DifficultySquaresWrapper>
					{Object.values(Difficulty).map((difficulty) => (
						<Tooltip key={difficulty} delay={500} title={DIFFICULTY_RENAME[difficulty]}>
							<DificultySquareWrapper>
								<DifficultySquare
									color={DIFFICULTY_COLORS[difficulty]}
									isOn={!!song.difficultiesById[difficulty]}
									isSelected={difficultyToLoad === difficulty}
									onClick={() => {
										const difficultyExists = !!song.difficultiesById[difficulty];

										if (difficultyExists) {
											dispatch(changeSelectedDifficulty({ songId: song.id, difficulty }));
										}
									}}
								/>
							</DificultySquareWrapper>
						</Tooltip>
					))}
				</DifficultySquaresWrapper>
			</DifficultySquaresCell>
			<ActionsCell>
				<Actions>
					<MiniButton
						style={{
							height: CELL_HEIGHT,
							paddingLeft: UNIT * 2,
							paddingRight: UNIT * 2,
						}}
						to={"/edit/$sid/$bid/notes"}
						params={{ sid: song.id.toString(), bid: difficultyToLoad.toString() }}
					>
						Load Map
					</MiniButton>
					<Spacer size={UNIT} />
					<SongRowActions songId={song.id} size={CELL_HEIGHT} />
				</Actions>
			</ActionsCell>
		</tr>
	);
};

const Cell = styled.td`
  height: ${CELL_HEIGHT + UNIT * 2}px;
  padding: ${UNIT}px;
  vertical-align: top;

  &:last-of-type {
    padding-right: 0;
    text-align: right;
  }
`;

const CoverArtCell = styled(Cell)`
  width: ${CELL_HEIGHT}px;
`;

const DescriptionCell = styled(Cell)``;
const ActionsCell = styled(Cell)`
  width: 138px;
`;

const Actions = styled.div`
  display: flex;
`;

const Demo = styled.span`
  color: ${COLORS.yellow[500]};
  margin-left: 8px;
  font-size: 0.8em;
`;

const DifficultySquaresCell = styled(Cell)`
  padding-left: ${UNIT * 2}px;
  padding-right: ${UNIT * 2}px;
  width: ${SQUARE_SIZE * 5 + SQUARE_PADDING * 8 + UNIT * 3}px;
`;

const DifficultySquaresWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${CELL_HEIGHT}px;
`;

const DificultySquareWrapper = styled(UnstyledButton)`
  padding: ${SQUARE_PADDING}px;
  cursor: default;
`;

const DifficultySquare = styled.div<{ isOn: boolean; isSelected: boolean }>`
  position: relative;
  width: ${SQUARE_SIZE}px;
  height: ${SQUARE_SIZE}px;
  border-radius: 3px;
  background-color: ${(props) => (props.isOn ? props.color : COLORS.gray[700])};
  cursor: ${(props) => (props.isOn ? "pointer" : "not-allowed")};

  &:after {
    content: ${(props) => (props.isSelected ? '""' : undefined)};
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid ${COLORS.white};
    border-radius: 8px;
    opacity: 0.5;
  }
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${COLORS.white};
`;

const Artist = styled.div`
  font-size: 15px;
  font-weight: 300;
  color: ${COLORS.gray[300]};
`;

export default SongsTableRow;
