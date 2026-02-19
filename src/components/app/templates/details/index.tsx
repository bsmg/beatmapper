import { useParams } from "@tanstack/react-router";

import { UpdateBeatmapForm, UpdateSongForm } from "$/components/app/forms";
import { useMount } from "$/components/hooks/use-mount";
import { For } from "$/components/ui/atoms";
import { Heading, RouterLink } from "$/components/ui/compositions";
import { stopPlayback, updateModuleEnabled } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectEditorOffset, selectModuleEnabled } from "$/store/selectors";
import { Stack, styled, Wrap } from "$:styled-system/jsx";
import CustomColorSettings from "./custom-colors";
import SongDetailsModule from "./module";

function SongDetails() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const dispatch = useAppDispatch();
	const enabledCustomColors = useAppSelector((state) => selectModuleEnabled(state, sid, "customColors"));
	const enabledMappingExtensions = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const beatmapIds = useAppSelector((state) => selectBeatmapIds(state, sid));
	const offset = useAppSelector((state) => selectEditorOffset(state, sid));

	useMount(() => {
		// We want to stop & reset the song when the user goes to edit it.
		// In addition to seeming like a reasonable idea, it helps prevent any weirdness around editing the audio file when it's in a non-zero position.
		dispatch(stopPlayback({ offset: offset }));
	});

	return (
		<Stack gap={8}>
			<Stack gap={6}>
				<Heading rank={1}>Song Details</Heading>
				<UpdateSongForm />
			</Stack>
			<Stack gap={6}>
				<Heading rank={1}>Beatmaps</Heading>
				<Wrap gap={2} justify={"center"}>
					<For each={beatmapIds}>
						{(beatmapId) => (
							<BeatmapWrapper key={beatmapId}>
								<UpdateBeatmapForm bid={beatmapId} />
							</BeatmapWrapper>
						)}
					</For>
				</Wrap>
			</Stack>
			<Stack gap={6}>
				<Heading rank={1}>Advanced Settings</Heading>
				<Stack gap={3}>
					<SongDetailsModule label="Custom Colors" render={() => <CustomColorSettings />} checked={enabledCustomColors} onCheckedChange={() => dispatch(updateModuleEnabled({ songId: sid, key: "customColors" }))}>
						Override individual elements of a beatmap's color scheme.{" "}
						<RouterLink target="_self" to="/docs/$" params={{ _splat: "mods#custom-color-overrides" }}>
							Learn more
						</RouterLink>
						.
					</SongDetailsModule>
					<SongDetailsModule label="Mapping Extensions" render={() => null} checked={enabledMappingExtensions} onCheckedChange={() => dispatch(updateModuleEnabled({ songId: sid, key: "mappingExtensions" }))}>
						Allows you to customize size and shape of the grid, to place notes outside of the typical 4×3 grid.{" "}
						<RouterLink target="_self" to="/docs/$" params={{ _splat: "mods#mapping-extensions" }}>
							Learn more
						</RouterLink>
						.
					</SongDetailsModule>
				</Stack>
			</Stack>
		</Stack>
	);
}

const BeatmapWrapper = styled("div", {
	base: {
		colorPalette: "slate",
		layerStyle: "fill.surface",
		padding: 3,
		width: "250px",
		height: "fit-content",
	},
});

export default SongDetails;
