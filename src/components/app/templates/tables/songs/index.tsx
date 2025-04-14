import { Link } from "@tanstack/react-router";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowRightToLineIcon } from "lucide-react";
import { useMemo } from "react";

import { changeSelectedDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSongs, selectIsProcessingImport, selectSongById } from "$/store/selectors";
import type { App } from "$/types";

import { HStack, Stack, styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import { CoverArtFilePreview } from "$/components/app/compositions";
import { createBeatmapListCollection } from "$/components/app/constants";
import { Button, DataTable, Select, Spinner } from "$/components/ui/compositions";
import SongRowActions from "./actions";

const helper = createColumnHelper<App.Song>();

const SONG_TABLE = [
	helper.accessor((data) => data.coverArtFilename, {
		id: "cover",
		size: 40,
		header: () => null,
		cell: (ctx) => {
			const coverArtFilename = ctx.getValue();
			return <CoverArtFilePreview filename={coverArtFilename} width={40} />;
		},
	}),
	helper.accessor((data) => [data.name, data.artistName, data.demo] as const, {
		id: "metadata",
		size: 240,
		header: () => "Title",
		cell: (ctx) => {
			const [name, artistName, demo] = ctx.getValue();
			return (
				<Stack gap={0.5}>
					<Title>
						{name}
						{demo && <Demo>(Demo song)</Demo>}
					</Title>
					<Artist>{artistName}</Artist>
				</Stack>
			);
		},
	}),
	helper.accessor((data) => [data.id, createBeatmapListCollection({ song: data })] as const, {
		id: "beatmaps",
		size: 120,
		header: () => "Beatmaps",
		cell: (ctx) => {
			const dispatch = useAppDispatch();
			const [sid, collection] = ctx.getValue();
			const song = useAppSelector((state) => selectSongById(state, sid));
			const initialValue = useMemo(() => [song.selectedDifficulty?.toString() ?? Object.keys(song.difficultiesById)[0]], [song]);
			return <Select collection={collection} value={initialValue} onValueChange={(details) => dispatch(changeSelectedDifficulty({ songId: sid, difficulty: details.value[0] }))} />;
		},
	}),
	helper.accessor((data) => [data.id] as const, {
		id: "actions",
		size: 80,
		header: () => "Actions",
		cell: (ctx) => {
			const [sid] = ctx.getValue();
			const song = useAppSelector((state) => selectSongById(state, sid));
			const selectedDifficulty = useMemo(() => song.selectedDifficulty?.toString() ?? Object.keys(song.difficultiesById)[0], [song]);
			return (
				<HStack gap={1}>
					<SongRowActions sid={sid} />
					<Link to={"/edit/$sid/$bid/notes"} params={{ sid: sid.toString(), bid: selectedDifficulty.toString() }}>
						<Button variant="subtle" size="icon">
							<ArrowRightToLineIcon />
						</Button>
					</Link>
				</HStack>
			);
		},
	}),
];

function SongDataTable() {
	const songs = useAppSelector(selectAllSongs);
	const isProcessingImport = useAppSelector(selectIsProcessingImport);

	const table = useReactTable({
		columns: SONG_TABLE,
		data: songs,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Wrapper>
			<DataTable table={table} />
			{isProcessingImport && (
				<LoadingBlocker>
					<Spinner />
				</LoadingBlocker>
			)}
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		position: "relative",
	},
});

const LoadingBlocker = styled("div", {
	base: center.raw({
		position: "absolute",
		inset: 0,
		zIndex: 2,
		backgroundColor: "color-mix(in srgb, {colors.bg.canvas}, transparent)",
	}),
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

const Demo = styled("span", {
	base: {
		colorPalette: "yellow",
		color: { _light: "colorPalette.700", _dark: "colorPalette.500" },
		fontSize: "0.8em",
		marginLeft: 1,
	},
});

export default SongDataTable;
