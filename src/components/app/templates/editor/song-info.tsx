import type { MenuSelectionDetails } from "@ark-ui/react/menu";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Fragment, memo, useCallback, useMemo } from "react";

import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { createDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { HStack, Stack, styled } from "$:styled-system/jsx";
import { CoverArtFilePreview } from "$/components/app/compositions";
import { createBeatmapListCollection } from "$/components/app/constants";
import { CreateBeatmapForm } from "$/components/app/forms";
import { Button, Dialog, Menu, Text } from "$/components/ui/compositions";

const COVER_ART_SIZES = {
	medium: 75,
	small: 50,
};

interface Props {
	sid: SongId;
	bid: BeatmapId;
	showDifficultySelector: boolean;
}
function EditorSongInfo({ sid, bid, showDifficultySelector }: Props) {
	const dispatch = useAppDispatch();
	const song = useAppSelector((state) => selectSongById(state, sid));
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
			dispatch(createDifficulty({ songId: sid, difficulty: id, afterCreate: () => {} }));
			navigate({ to: "/edit/$sid/$bid/notes", params: { sid: sid.toString(), bid: id.toString() } });
		},
		[navigate, dispatch, sid],
	);

	return (
		<Fragment>
			<OuterWrapper gap={1.5}>
				<CoverArtFilePreview filename={song.coverArtFilename} width={COVER_ART_SIZES[showDifficultySelector ? "medium" : "small"]} />
				<Stack gap={1}>
					<Stack gap={0.5}>
						<Text color={"fg.default"} fontSize="20px" fontWeight={500} lineHeight={1}>
							{song.name}
						</Text>
						<Text color={"fg.muted"} fontSize="16px" fontWeight={400} lineHeight={1}>
							{song.artistName}
						</Text>
					</Stack>
					{showDifficultySelector && bid && (
						<Fragment>
							<HStack gap={0.5}>
								<Menu collection={BEATMAP_LIST_COLLECTION} onSelect={handleBeatmapSelect}>
									<Button variant="ghost" size="sm">
										<Text fontSize="14px" fontWeight={400} lineHeight={1}>
											{song.selectedDifficulty}
										</Text>
									</Button>
								</Menu>
								<Dialog
									title="Create New Beatmap"
									render={(ctx) => (
										<CreateBeatmapForm dialog={ctx} sid={sid} bid={bid} onSubmit={handleCreate}>
											{({ id }) => `Create ${id && getLabelForDifficulty(id)} beatmap`}
										</CreateBeatmapForm>
									)}
								>
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
}

const OuterWrapper = styled(HStack, {
	base: {
		position: "absolute",
		zIndex: 1,
		top: 2,
		left: 2,
		userSelect: "none",
	},
});

export default memo(EditorSongInfo);
