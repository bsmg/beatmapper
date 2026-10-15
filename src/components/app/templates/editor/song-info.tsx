import { createListCollection } from "@ark-ui/react/collection";
import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { type SelectValueChangeDetails, useSelect } from "@ark-ui/react/select";
import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import { CoverArtFile } from "$/components/app/compositions";
import { CreateBeatmapForm } from "$/components/app/forms";
import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { Button, SelectProvider, usePrompt } from "$/components/ui/compositions";
import { BeatmapFilestore } from "$/services/file.service";
import { addBeatmap, updateSelectedBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmaps, selectLoading, selectSelectedBeatmap, selectSongMetadata } from "$/store/selectors";
import { HStack, Stack, styled, Text } from "$:styled-system/jsx";

function EditorSongInfo() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });
	const navigate = useNavigate();

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const metadata = useAppSelector((state) => selectSongMetadata(state, sid));
	const selectedBeatmap = useAppSelector((state) => selectSelectedBeatmap(state, sid));
	const beatmaps = useAppSelector((state) => selectBeatmaps(state, sid));

	const beatmapSelect = useSelect<unknown>({
		collection: createListCollection<unknown>({
			items: Object.keys(beatmaps),
			itemToString: (beatmapId) => beatmaps[beatmapId as string].customLabel ?? (beatmapId as string),
		}),
		value: [selectedBeatmap.toString()],
		onValueChange: (details: SelectValueChangeDetails) => {
			dispatch(updateSelectedBeatmap({ songId: sid, beatmapId: details.value[0] }));
			return navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: details.value[0] } });
		},
	});

	const { trigger: triggerCreateBeatmap } = usePrompt({
		title: "Create Beatmap",
		description: "Add a new beatmap file to the mapset.",
		render: (ctx) => (
			<CreateBeatmapForm dialog={ctx.dialog} onSubmit={(id, data) => dispatch(addBeatmap({ songId: sid, beatmapId: id, data: { ...data, lightshowId: id } }))}>
				{(id) => (id ? `Create "${id}" beatmap` : `Create beatmap`)}
			</CreateBeatmapForm>
		),
	});

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes("editor"), []);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !isLoading && hotkeys.getActiveScopes().includes("navigation"), [isLoading, hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Open Beatmap Selector", hotkey: "Mod+O", action: () => beatmapSelect.setOpen(true) });
	useHotkey({ scopes, category, enabled, label: "Create New Beatmap", hotkey: "Mod+N", action: () => triggerCreateBeatmap() });

	return (
		<OuterWrapper gap={1.5}>
			<CoverArtFile filename={BeatmapFilestore.resolveFilename(sid, "cover", {})} boxSize={75} />
			<Stack gap={1}>
				<Stack gap={0.5}>
					<Text color={"fg.default"} fontSize={"20px"} fontWeight={400} lineHeight={1}>
						{metadata.title}
					</Text>
					<Text color={"fg.muted"} fontSize={"16px"} fontWeight={400} lineHeight={1}>
						{metadata.artist}
					</Text>
				</Stack>
				<HStack gap={0.5}>
					<SelectProvider unfocusOnPress value={beatmapSelect} size="sm" />
					<Button variant="ghost" size="sm" onClick={triggerCreateBeatmap}>
						<PlusIcon size={16} />
					</Button>
				</HStack>
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
