import type { MenuSelectionDetails } from "@ark-ui/react/menu";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, memo, useCallback, useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectActiveBeatmapId, selectSongById } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { HStack, Stack, styled } from "$:styled-system/jsx";
import { createBeatmapListCollection } from "$/components/app/constants";
import { Button, Dialog, Menu, Text } from "$/components/ui/compositions";
import { PlusIcon } from "lucide-react";
import CoverArtImage from "../CoverArtImage";
import CreateDifficultyForm from "../CreateDifficultyForm";

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
	const navigate = useNavigate();

	const BEATMAP_LIST_COLLECTION = useMemo(() => createBeatmapListCollection({ song }), [song]);

	const handleBeatmapSelect = useCallback(
		(details: MenuSelectionDetails) => {
			if (details.value === "create-new") {
				return;
			}
			return navigate({ to: "/edit/$sid/$bid/notes", params: { sid: song.id.toString(), bid: details.value } });
		},
		[navigate, song.id],
	);

	const handleCreate = useCallback(
		(id: BeatmapId) => {
			navigate({ to: "/edit/$sid/$bid/notes", params: { sid: song.id.toString(), bid: id.toString() } });
		},
		[navigate, song.id],
	);

	return (
		<Fragment>
			<OuterWrapper gap={1.5}>
				<CoverArtImage size={COVER_ART_SIZES[coverArtSize]} filename={song.coverArtFilename} />
				<Stack gap={1}>
					<Stack gap={0.5}>
						<Text color={"fg.default"} fontSize="20px" fontWeight={500} lineHeight={1}>
							{song.name}
						</Text>
						<Text color={"fg.muted"} fontSize="16px" fontWeight={400} lineHeight={1}>
							{song.artistName}
						</Text>
					</Stack>
					{showDifficultySelector && selectedDifficulty && (
						<Fragment>
							<HStack gap={0.5}>
								<Menu collection={BEATMAP_LIST_COLLECTION} onSelect={handleBeatmapSelect}>
									<Button variant="ghost" size="sm">
										<Text fontSize="14px" fontWeight={400} lineHeight={1}>
											{song.selectedDifficulty}
										</Text>
									</Button>
								</Menu>
								<Dialog title="Create New Beatmap" render={(ctx) => <CreateDifficultyForm dialog={ctx} songId={songId} afterCreate={handleCreate} />}>
									<Button variant="ghost" size="sm">
										<PlusIcon size={16} />
									</Button>
								</Dialog>
							</HStack>
						</Fragment>
					)}
				</Stack>
			</OuterWrapper>
		</Fragment>
	);
};

const OuterWrapper = styled(HStack, {
	base: {
		position: "absolute",
		zIndex: 1,
		top: 2,
		left: 2,
		userSelect: "none",
	},
});

export default memo(SongInfo);
