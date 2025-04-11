import { changeSelectedDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import type { SongId } from "$/types";

import { HStack, Stack, styled } from "$:styled-system/jsx";
import { createBeatmapListCollection } from "$/components/app/constants";
import { Button, Select } from "$/components/ui/compositions";
import { Table } from "$/components/ui/styled";
import { Link } from "@tanstack/react-router";
import { ArrowRightToLineIcon } from "lucide-react";
import { useMemo } from "react";
import CoverArtImage from "../CoverArtImage";
import SongRowActions from "./SongRowActions";

interface Props {
	songId: SongId;
}

const SongsTableRow = ({ songId }: Props) => {
	const song = useAppSelector((state) => selectSongById(state, songId));
	const dispatch = useAppDispatch();

	const difficultyToLoad = useMemo(() => song.selectedDifficulty || Object.keys(song.difficultiesById)[0], [song.selectedDifficulty, song.difficultiesById]);

	const BEATMAP_LIST_COLLECTION = useMemo(() => createBeatmapListCollection({ song }), [song]);

	return (
		<Table.Row>
			<CoverArtCell>
				<CoverArtImage filename={song.coverArtFilename} size={CELL_HEIGHT} />
			</CoverArtCell>
			<DescriptionCell>
				<Stack gap={0.5}>
					<Title>
						{song.name}
						{song.demo && <Demo>(Demo song)</Demo>}
					</Title>
					<Artist>{song.artistName}</Artist>
				</Stack>
			</DescriptionCell>
			<DifficultySquaresCell>
				<Select collection={BEATMAP_LIST_COLLECTION} value={[difficultyToLoad.toString()]} onValueChange={(details) => dispatch(changeSelectedDifficulty({ songId: song.id, difficulty: details.value[0] }))} />
			</DifficultySquaresCell>
			<ActionsCell>
				<HStack gap={1}>
					<SongRowActions songId={song.id} />
					<Link to={"/edit/$sid/$bid/notes"} params={{ sid: song.id.toString(), bid: difficultyToLoad.toString() }}>
						<Button variant="subtle" size="icon">
							<ArrowRightToLineIcon />
						</Button>
					</Link>
				</HStack>
			</ActionsCell>
		</Table.Row>
	);
};

const CELL_HEIGHT = "40px";

const CoverArtCell = styled(Table.Cell, {
	base: {
		width: `calc(${CELL_HEIGHT} + {spacing.2})`,
	},
});

const DescriptionCell = styled(Table.Cell);

const DifficultySquaresCell = styled(Table.Cell);

const ActionsCell = styled(Table.Cell, {
	base: {
		width: "90px",
	},
});

const Demo = styled("span", {
	base: {
		colorPalette: "yellow",
		color: { _light: "colorPalette.700", _dark: "colorPalette.500" },
		fontSize: "0.8em",
		marginLeft: 1,
	},
});

const Title = styled("div", {
	base: {
		fontSize: "16px",
		fontWeight: 400,
		color: "fg.default",
	},
});

const Artist = styled("div", {
	base: {
		fontSize: "15px",
		fontWeight: 300,
		color: "fg.muted",
	},
});

export default SongsTableRow;
