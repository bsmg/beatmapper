import { useListCollection } from "@ark-ui/react/collection";
import { Link } from "@tanstack/react-router";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowRightToLineIcon } from "lucide-react";
import { Fragment, useCallback } from "react";

import { CoverArtFile } from "$/components/app/compositions";
import { Button, DataTable, Select, Spinner } from "$/components/ui/compositions";
import { resolveSongId } from "$/helpers/song.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { updateSelectedBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSongs, selectBeatmaps, selectDemo, selectProcessingImport, selectSelectedBeatmap, selectSongMetadata } from "$/store/selectors";
import type { App, SongId } from "$/types";
import { HStack, styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import SongsDataTableActions from "./actions";

const helper = createColumnHelper<App.ISong>();

interface Props {
	songId: SongId;
}
function Metadata({ songId }: Props) {
	const metadata = useAppSelector((state) => selectSongMetadata(state, songId));
	const isDemo = useAppSelector((state) => selectDemo(state, songId));

	return (
		<Fragment>
			<Title>
				{metadata.title}
				{isDemo && <Demo>(Demo song)</Demo>}
			</Title>
			<Artist>{metadata.artist}</Artist>
		</Fragment>
	);
}
function Beatmaps({ songId }: Props) {
	const dispatch = useAppDispatch();
	const selectedBeatmap = useAppSelector((state) => selectSelectedBeatmap(state, songId));
	const beatmaps = useAppSelector((state) => selectBeatmaps(state, songId));

	const { collection } = useListCollection({
		initialItems: Object.keys(beatmaps),
		itemToString: (beatmapId) => beatmaps[beatmapId].customLabel ?? beatmapId,
	});

	return <Select collection={collection} value={[selectedBeatmap.toString()]} onValueChange={(details) => dispatch(updateSelectedBeatmap({ songId, beatmapId: details.value[0] }))} />;
}
function Actions({ songId }: Props) {
	const selectedBeatmapId = useAppSelector((state) => selectSelectedBeatmap(state, songId));

	return (
		<HStack justify={"start"} gap={1}>
			<SongsDataTableActions sid={songId} />
			<Link to={"/edit/$sid/$bid/notes"} params={{ sid: songId.toString(), bid: selectedBeatmapId.toString() }}>
				<Button variant="subtle" size="icon">
					<ArrowRightToLineIcon />
				</Button>
			</Link>
		</HStack>
	);
}

function SongsDataTable() {
	const songs = useAppSelector(selectAllSongs);
	const isProcessingImport = useAppSelector(selectProcessingImport);

	// biome-ignore lint/correctness/useExhaustiveDependencies: force rerender when songs change
	const getColumns = useCallback(
		() => [
			helper.accessor((data) => resolveSongId(data), {
				id: "cover",
				size: 40,
				header: () => null,
				cell: (ctx) => <CoverArtFile filename={BeatmapFilestore.resolveFilename(ctx.getValue(), "cover", {})} boxSize={40} />,
			}),
			helper.accessor((data) => resolveSongId(data), {
				id: "metadata",
				size: 240,
				header: () => "Title",
				cell: (ctx) => <Metadata songId={ctx.getValue()} />,
			}),
			helper.accessor((data) => resolveSongId(data), {
				id: "beatmaps",
				size: 120,
				header: () => "Beatmaps",
				cell: (ctx) => <Beatmaps songId={ctx.getValue()} />,
			}),
			helper.accessor((data) => resolveSongId(data), {
				id: "actions",
				size: 80,
				header: () => "Actions",
				cell: (ctx) => <Actions songId={ctx.getValue()} />,
			}),
		],
		[songs],
	);

	const table = useReactTable({
		columns: getColumns(),
		data: songs,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Wrapper>
			<DataTable data={table} />
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
