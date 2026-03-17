import { useListCollection } from "@ark-ui/react/collection";
import type { SelectValueChangeDetails } from "@ark-ui/react/select";
import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { memo, useCallback } from "react";

import { CoverArtFile } from "$/components/app/compositions";
import { CreateBeatmapForm } from "$/components/app/forms";
import { Button, Dialog, Select } from "$/components/ui/compositions";
import { BeatmapFilestore } from "$/services/file.service";
import { addBeatmap, updateSelectedBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmaps, selectSelectedBeatmap, selectSongMetadata } from "$/store/selectors";
import { HStack, Stack, styled, Text } from "$:styled-system/jsx";

const COVER_ART_SIZES = {
	medium: 75,
	small: 50,
};

interface Props {
	showDifficultySelector: boolean;
}
function EditorSongInfo({ showDifficultySelector }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const metadata = useAppSelector((state) => selectSongMetadata(state, sid));
	const selectedBeatmap = useAppSelector((state) => selectSelectedBeatmap(state, sid));
	const beatmaps = useAppSelector((state) => selectBeatmaps(state, sid));

	const { collection: BEATMAP_LIST_COLLECTION } = useListCollection({
		initialItems: Object.keys(beatmaps),
		itemToString: (beatmapId) => beatmaps[beatmapId].customLabel ?? beatmapId,
	});

	const handleBeatmapSelect = useCallback(
		(details: SelectValueChangeDetails) => {
			dispatch(updateSelectedBeatmap({ songId: sid, beatmapId: details.value[0] }));
			return navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: details.value[0] } });
		},
		[dispatch, navigate, sid, view],
	);

	return (
		<OuterWrapper gap={1.5}>
			<CoverArtFile filename={BeatmapFilestore.resolveFilename(sid, "cover", {})} boxSize={COVER_ART_SIZES[showDifficultySelector ? "medium" : "small"]} />
			<Stack gap={1}>
				<Stack gap={0.5}>
					<Text color={"fg.default"} fontSize={"20px"} fontWeight={400} lineHeight={1}>
						{metadata.title}
					</Text>
					<Text color={"fg.muted"} fontSize={"16px"} fontWeight={400} lineHeight={1}>
						{metadata.artist}
					</Text>
				</Stack>
				{showDifficultySelector && (
					<HStack gap={0.5}>
						<Select unfocusOnPress size="sm" collection={BEATMAP_LIST_COLLECTION} value={[selectedBeatmap.toString()]} onValueChange={handleBeatmapSelect} />
						<Dialog
							title="Create New Beatmap"
							description="Add a new beatmap file to the mapset."
							lazyMount
							unmountOnExit
							render={(ctx) => (
								<CreateBeatmapForm dialog={ctx} onSubmit={(id, data) => dispatch(addBeatmap({ songId: sid, beatmapId: id, data: { ...data, lightshowId: id } }))}>
									{(id) => (id ? `Create "${id}" beatmap` : `Create beatmap`)}
								</CreateBeatmapForm>
							)}
						>
							<Button variant="ghost" size="sm">
								<PlusIcon size={16} />
							</Button>
						</Dialog>
					</HStack>
				)}
			</Stack>
		</OuterWrapper>
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
