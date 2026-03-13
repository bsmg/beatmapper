import { useListCollection } from "@ark-ui/react/collection";
import { useParams } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useCallback } from "react";

import { CreateBeatmapForm, UpdateSongForm } from "$/components/app/forms";
import { Match, Switch } from "$/components/ui/atoms";
import { Button, Dialog, Heading, Tabs, usePrompt } from "$/components/ui/compositions";
import { addBeatmap, addColorScheme } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { HStack, Stack } from "$:styled-system/jsx";
import { createAddColorSchemePrompt } from "../../constants";
import AdvancedSettingsDetails from "./advanced-settings";
import BeatmapDetails from "./beatmaps";
import ColorSchemeDetails from "./color-schemes";

function SongDetails() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();

	const { collection } = useListCollection({
		initialItems: ["Song", "Beatmaps", "Color Schemes", "Mod Settings"],
	});

	const { trigger: triggerAddColorScheme } = usePrompt(
		createAddColorSchemePrompt({
			render: ({ form }) => <form.AppField name="name">{(ctx) => <ctx.Input autoFocus label="Name" required />}</form.AppField>,
			onSubmit: ({ value: { name } }) => dispatch(addColorScheme({ songId: sid, colorSchemeId: name })),
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
								description="Add a new beatmap file to the map."
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
			<Tabs lazyMount unmountOnExit collection={collection} renderItem={renderItem} />
		</Stack>
	);
}

export default SongDetails;
