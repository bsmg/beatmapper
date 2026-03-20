import { useListCollection } from "@ark-ui/react/collection";
import { useParams } from "@tanstack/react-router";
import { EnvironmentSchemeName } from "bsmap";
import { PlusIcon } from "lucide-react";
import { useCallback } from "react";

import { createAddColorSchemePrompt } from "$/components/app/constants";
import { CreateBeatmapForm, UpdateSongForm } from "$/components/app/forms";
import { Match, Switch } from "$/components/ui/atoms";
import { Button, Dialog, Heading, Tabs, usePrompt } from "$/components/ui/compositions";
import { getColorSchemePresets } from "$/helpers/colors.helpers";
import { addBeatmap, addColorScheme } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectEnvironment } from "$/store/selectors";
import { HStack, Stack } from "$:styled-system/jsx";
import AdvancedSettingsDetails from "./advanced-settings";
import BeatmapDetails from "./beatmaps";
import ColorSchemeDetails from "./color-schemes";

function SongDetails() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const environment = useAppSelector((state) => selectEnvironment(state, sid, bid));

	const { collection: TABS_COLLECTION } = useListCollection({
		initialItems: ["Song", "Beatmaps", "Color Schemes", "Mod Settings"],
	});
	const { collection: COLOR_SCHEME_PRESET_COLLECTION } = useListCollection({
		initialItems: Object.keys(getColorSchemePresets()),
	});

	const { trigger: triggerAddColorScheme } = usePrompt(
		createAddColorSchemePrompt({
			render: ({ form }) => (
				<form.Row>
					<form.AppField name="name">{(ctx) => <ctx.Input autoFocus label="Name" required />}</form.AppField>
					<form.AppField name="preset">{(ctx) => <ctx.Combobox label="Preset" placeholder="Active Color Scheme" clearable collection={COLOR_SCHEME_PRESET_COLLECTION} />}</form.AppField>
				</form.Row>
			),
			onSubmit: ({ value: { name, preset } }) => dispatch(addColorScheme({ songId: sid, colorSchemeId: name, colorSchemePreset: preset ?? EnvironmentSchemeName[environment] })),
		}),
	);

	const renderItem = useCallback(
		(item: string) => (
			<Switch>
				<Stack gap={3}>
					<Match when={item === "Song"}>
						<Heading rank={2}>Song Details</Heading>
						<UpdateSongForm />
					</Match>
					<Match when={item === "Beatmaps"}>
						<HStack gap={2}>
							<Heading rank={2}>Beatmaps</Heading>
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
								<Button variant={"subtle"} size={"sm"}>
									<PlusIcon size={16} />
								</Button>
							</Dialog>
						</HStack>
						<BeatmapDetails />
					</Match>
					<Match when={item === "Color Schemes"}>
						<HStack gap={2}>
							<Heading rank={2}>Color Schemes</Heading>
							<Button variant={"subtle"} size={"sm"} onClick={triggerAddColorScheme}>
								<PlusIcon size={16} />
							</Button>
						</HStack>
						<ColorSchemeDetails />
					</Match>
					<Match when={item === "Mod Settings"}>
						<Heading rank={2}>Mod Settings</Heading>
						<AdvancedSettingsDetails />
					</Match>
				</Stack>
			</Switch>
		),
		[dispatch, sid, triggerAddColorScheme],
	);

	return (
		<Stack gap={3}>
			<Heading rank={1}>Map Details</Heading>
			<Tabs lazyMount unmountOnExit collection={TABS_COLLECTION} renderItem={renderItem} />
		</Stack>
	);
}

export default SongDetails;
