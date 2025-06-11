import { Link } from "@tanstack/react-router";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowRightToLineIcon } from "lucide-react";
import { useMemo } from "react";

import { createBeatmapListCollection } from "$/components/app/constants";
import { getBeatmapIds, getSongMetadata, isSongReadonly, resolveSongId } from "$/helpers/song.helpers";
import { updateSelectedBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSongs, selectProcessingImport, selectSelectedBeatmap } from "$/store/selectors";
import type { App } from "$/types";

import { HStack, Stack, styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import { CoverArtFilePreview } from "$/components/app/compositions";
import { Button, DataTable, Select, Spinner } from "$/components/ui/compositions";
import SongsDataTableActions from "./actions";

const helper = createColumnHelper<App.ISong>();

const SONG_TABLE = [
	helper.accessor((data) => [resolveSongId(data)], {
		id: "cover",
		size: 40,
		header: () => null,
		cell: (ctx) => {
			const [sid] = ctx.getValue();
			return <CoverArtFilePreview songId={sid} width={40} />;
		},
	}),
	helper.accessor((data) => [getSongMetadata(data), isSongReadonly(data)] as const, {
		id: "metadata",
		size: 240,
		header: () => "Title",
		cell: (ctx) => {
			const [metadata, demo] = ctx.getValue();
			return (
				<Stack gap={0.5}>
					<Title>
						{metadata.title}
						{demo && <Demo>(Demo song)</Demo>}
					</Title>
					<Artist>{metadata.artist}</Artist>
				</Stack>
			);
		},
	}),
	helper.accessor((data) => [resolveSongId(data), createBeatmapListCollection({ beatmapIds: getBeatmapIds(data) })] as const, {
		id: "beatmaps",
		size: 120,
		header: () => "Beatmaps",
		cell: (ctx) => {
			const dispatch = useAppDispatch();
			const [sid, collection] = ctx.getValue();
			const selectedBeatmap = useAppSelector((state) => selectSelectedBeatmap(state, sid));
			const initialValue = useMemo(() => [selectedBeatmap.toString()], [selectedBeatmap]);
			return <Select collection={collection} value={initialValue} onValueChange={(details) => dispatch(updateSelectedBeatmap({ songId: sid, beatmapId: details.value[0] }))} />;
		},
	}),
	helper.accessor((data) => [resolveSongId(data)] as const, {
		id: "actions",
		size: 80,
		header: () => "Actions",
		cell: (ctx) => {
			const [sid] = ctx.getValue();
			const selectedBeatmap = useAppSelector((state) => selectSelectedBeatmap(state, sid));
			return (
				<HStack gap={1}>
					<SongsDataTableActions sid={sid} />
					<Link to={"/edit/$sid/$bid/notes"} params={{ sid: sid.toString(), bid: selectedBeatmap.toString() }}>
						<Button variant="subtle" size="icon">
							<ArrowRightToLineIcon />
						</Button>
					</Link>
				</HStack>
			);
		},
	}),
];

function SongsDataTable() {
	const songs = useAppSelector(selectAllSongs);
	const isProcessingImport = useAppSelector(selectProcessingImport);

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
		"& th:nth-child(3)": {
			display: { base: "none", md: "block" },
		},
		"& td:nth-child(3)": {
			display: { base: "none", md: "block" },
		},
	},
});

const LoadingBlocker = styled("div", {
	base: center.raw({
		position: "absolute",
		inset: 0,
		backgroundColor: "color-mix(in srgb, {colors.bg.canvas}, transparent)",
	}),
});

const Title = styled("div", {
	base: {
		fontSize: "16px",
		fontWeight: "normal",
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

export default SongsDataTable;
