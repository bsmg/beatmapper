import { createListCollection } from "@ark-ui/react/collection";
import { useDialog } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { useBlocker, useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { CharacteristicRename, DifficultyRename, NoteJumpSpeed } from "bsmap";
import type { EnvironmentAllName } from "bsmap/types";
import { DotIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { array, custom, minValue, null_, number, object, pipe, string, transform, union } from "valibot";

import { ENVIRONMENT_COLLECTION } from "$/components/app/constants";
import { CreateBeatmapForm } from "$/components/app/forms";
import { useSetupContext } from "$/components/context";
import { Interleave } from "$/components/ui/atoms";
import { AlertDialogProvider, Button, Collapsible, Dialog, Heading, Stat, useAppForm } from "$/components/ui/compositions";
import { addColorScheme, copyBeatmap, removeBeatmap, updateBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapById, selectBeatmaps, selectBpm, selectColorSchemeIds, selectLightshowIds } from "$/store/selectors";
import type { BeatmapId } from "$/types";
import { roundTo } from "$/utils";
import { HStack, Stack, Text, Wrap } from "$:styled-system/jsx";

const SCHEMA = object({
	lightshowId: string(),
	noteJumpSpeed: pipe(number(), minValue(0)),
	startBeatOffset: number(),
	environmentName: custom<EnvironmentAllName>((name) => typeof name === "string" && name.endsWith("Environment"), 'Invalid environment name: Must end with "Environment" as the suffix.'),
	colorSchemeName: union([string(), null_()]),
	mappers: array(string()),
	lighters: array(string()),
	customLabel: pipe(
		string(),
		transform((input) => (input === "" ? undefined : input)),
	),
});

interface Props {
	bid: BeatmapId;
}
function UpdateBeatmapForm({ bid }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const { toaster } = useSetupContext();

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const bpm = useAppSelector((state) => selectBpm(state, sid));
	const beatmaps = useAppSelector((state) => selectBeatmaps(state, sid));
	const lightshowIds = useAppSelector((state) => selectLightshowIds(state, sid));
	const colorSchemeIds = useAppSelector((state) => selectColorSchemeIds(state, sid));
	const savedVersion = useAppSelector((state) => selectBeatmapById(state, sid, bid));

	const LIGHTSHOW_COLLECTION = useMemo(() => createListCollection({ items: lightshowIds }), [lightshowIds]);
	const COLOR_SCHEME_COLLECTION = useMemo(() => createListCollection({ items: colorSchemeIds }), [colorSchemeIds]);

	const [showAdvancedControls, setShowAdvancedControls] = useState(false);

	const Form = useAppForm({
		defaultValues: {
			lightshowId: savedVersion.lightshowId.toString(),
			noteJumpSpeed: savedVersion.noteJumpSpeed,
			startBeatOffset: savedVersion.startBeatOffset,
			environmentName: savedVersion.environmentName,
			colorSchemeName: savedVersion.colorSchemeName,
			mappers: savedVersion.mappers ?? [],
			lighters: savedVersion.lighters ?? [],
			customLabel: savedVersion.customLabel ?? "",
		},
		validators: {
			onMount: SCHEMA,
			onChange: SCHEMA,
			onSubmit: SCHEMA,
		},
		onSubmit: async ({ value, formApi }) => {
			try {
				dispatch(
					updateBeatmap({
						songId: sid,
						beatmapId: bid,
						changes: {
							...value,
							customLabel: value.customLabel === "" ? undefined : value.customLabel,
						},
					}),
				);

				formApi.reset(value);
			} catch (error) {
				toaster?.error({ description: `Could not update beatmap: ${error instanceof Error ? error.message : "See console for more information."}` });
				return console.error(error);
			}
		},
	});

	const jumpSpeed = useStore(Form.store, (state) => state.values.noteJumpSpeed);
	const jumpOffset = useStore(Form.store, (state) => state.values.startBeatOffset);

	const njs = useMemo(() => NoteJumpSpeed.create(bpm, jumpSpeed, jumpOffset), [bpm, jumpSpeed, jumpOffset]);

	const deleteAlert = useDialog({ role: "alertdialog" });

	const handleDeleteBeatmap = useCallback(() => {
		// Delete our working state
		const mutableDifficultiesCopy = { ...beatmaps };
		delete mutableDifficultiesCopy[bid];

		// Don't let the user delete the last difficulty!
		const remainingDifficultyIds = Object.keys(mutableDifficultiesCopy);
		if (remainingDifficultyIds.length === 0) {
			return toaster?.error({
				id: "last-difficulty",
				description: "Sorry, you cannot delete the only remaining difficulty! Please create another difficulty first.",
			});
		}

		// If the user is currently editing the difficulty that they're trying to delete, let's redirect them to the next difficulty.
		const nextDifficultyId = remainingDifficultyIds[0];

		dispatch(removeBeatmap({ songId: sid, beatmapId: bid }));
		return navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: nextDifficultyId.toString() } });
	}, [dispatch, navigate, toaster, sid, bid, view, beatmaps]);

	const { proceed, reset, status } = useBlocker({
		shouldBlockFn: () => Form.state.isDirty,
		withResolver: true,
	});

	const isDirtyAlert = useDialog({ role: "alertdialog", open: status === "blocked" });

	return (
		<Form.AppForm>
			{status === "blocked" && <AlertDialogProvider value={isDirtyAlert} render={() => <Text textStyle={"paragraph"}>You have unsaved changes! Are you sure you want to leave this page? (You tweaked a value for the "{bid}" beatmap)</Text>} onSubmit={proceed} onCancel={reset} />}
			<Form.Root size="sm">
				<Stack gap={1}>
					<Heading rank={3}>{savedVersion.customLabel ?? bid}</Heading>
					<HStack gap={0}>
						<Interleave separator={(index) => <DotIcon key={index} size={16} />}>
							<Heading rank={4}>{CharacteristicRename[savedVersion.characteristic]}</Heading>
							<Heading rank={4}>{DifficultyRename[savedVersion.difficulty]}</Heading>
						</Interleave>
					</HStack>
				</Stack>
				<Stack gap={2}>
					<Form.Row>
						<Form.AppField name="noteJumpSpeed">{(ctx) => <ctx.NumberInput label="Jump speed" />}</Form.AppField>
						<Form.AppField name="startBeatOffset">{(ctx) => <ctx.NumberInput label="Jump offset" step={0.25} />}</Form.AppField>
					</Form.Row>
					<Form.Row>
						<Stat label="HJD (beats)">{njs.hjd}</Stat>
						<Stat label="JD (meters)">{roundTo(njs.jd, 3)}</Stat>
						<Stat label="RT (ms)">{Math.round(njs.reactionTime * 1000)}</Stat>
					</Form.Row>
					<Form.AppField name="mappers">{(ctx) => <ctx.TagsInput label="Mapper(s)" />}</Form.AppField>
					<Form.AppField name="lighters">{(ctx) => <ctx.TagsInput label="Lighter(s)" />}</Form.AppField>
					<Collapsible
						open={showAdvancedControls}
						onOpenChange={(x) => setShowAdvancedControls(x.open)}
						render={() => (
							<Stack gap={2}>
								<Form.Row>
									<Form.AppField name="lightshowId">{(ctx) => <ctx.Combobox key={JSON.stringify(lightshowIds)} label="Lightshow ID" creatable collection={LIGHTSHOW_COLLECTION} />}</Form.AppField>
									<Form.AppField name="customLabel">{(ctx) => <ctx.Input label="Custom label" />}</Form.AppField>
								</Form.Row>
								<Form.Row>
									<Form.AppField name="environmentName">{(ctx) => <ctx.Combobox creatable label="Environment Override" helperText={"If a newer environment is not available to select, create a new entry in the combobox."} collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
									<Form.AppField name="colorSchemeName">{(ctx) => <ctx.Combobox key={JSON.stringify(colorSchemeIds)} creatable clearable label="Color Scheme Override" collection={COLOR_SCHEME_COLLECTION} onValueCreate={(value) => dispatch(addColorScheme({ songId: sid, colorSchemeId: value }))} />}</Form.AppField>
								</Form.Row>
							</Stack>
						)}
					>
						<Button size="sm" variant="subtle" stretch>
							Show Advanced Settings
						</Button>
					</Collapsible>
				</Stack>
				<Wrap justify={"center"} gap={1}>
					<Form.Submit variant="subtle" size="sm">
						Save
					</Form.Submit>
					<Dialog
						title="Copy Beatmap"
						description={`Clone the contents of the "${bid}" beatmap to a new beatmap file.`}
						lazyMount
						unmountOnExit
						render={(ctx) => (
							<CreateBeatmapForm dialog={ctx} onSubmit={(id, data) => dispatch(copyBeatmap({ songId: sid, sourceBeatmapId: bid, targetBeatmapId: id, changes: data }))}>
								{(id) => (id ? `Create "${id}" beatmap` : `Create beatmap`)}
							</CreateBeatmapForm>
						)}
					>
						<Button variant="subtle" size="sm">
							Copy
						</Button>
					</Dialog>
					<AlertDialogProvider value={deleteAlert} render={() => <Text textStyle={"paragraph"}>Are you sure you want to do this? This action cannot be undone.</Text>} onSubmit={handleDeleteBeatmap}>
						<Button variant="subtle" size="sm" colorPalette="red">
							Delete
						</Button>
					</AlertDialogProvider>
				</Wrap>
			</Form.Root>
		</Form.AppForm>
	);
}

export default UpdateBeatmapForm;
