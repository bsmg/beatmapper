import { useBlocker, useNavigate } from "@tanstack/react-router";
import { CharacteristicRename, DifficultyRename, EnvironmentAllNameSchema } from "bsmap";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { DotIcon } from "lucide-react";
import { type MouseEventHandler, useCallback, useMemo, useState } from "react";
import { array, number, object, pipe, string, transform } from "valibot";

import { APP_TOASTER, ENVIRONMENT_COLLECTION, createColorSchemeCollection } from "$/components/app/constants";
import { copyBeatmap, removeBeatmap, updateBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapById, selectBeatmaps, selectColorSchemeIds } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { HStack, Stack, Wrap } from "$:styled-system/jsx";
import { CreateBeatmapForm } from "$/components/app/forms";
import { Interleave } from "$/components/ui/atoms";
import { Button, Collapsible, Dialog, Heading, useAppForm } from "$/components/ui/compositions";
import { useViewFromLocation } from "../hooks";

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function UpdateBeatmapForm({ sid, bid }: Props) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const view = useViewFromLocation();
	const beatmaps = useAppSelector((state) => selectBeatmaps(state, sid));
	const savedVersion = useAppSelector((state) => selectBeatmapById(state, sid, bid));

	const [showAdvancedControls, setShowAdvancedControls] = useState(false);

	const Form = useAppForm({
		defaultValues: {
			lightshowId: savedVersion.lightshowId.toString(),
			noteJumpSpeed: savedVersion.noteJumpSpeed,
			startBeatOffset: savedVersion.startBeatOffset,
			environmentName: savedVersion.environmentName,
			colorSchemeName: savedVersion.colorSchemeName ?? "",
			mappers: savedVersion.mappers ?? [],
			lighters: savedVersion.lighters ?? [],
			customLabel: savedVersion.customLabel ?? "",
		},
		validators: {
			onChange: object({
				lightshowId: string(),
				noteJumpSpeed: number(),
				startBeatOffset: number(),
				environmentName: EnvironmentAllNameSchema,
				colorSchemeName: string(),
				mappers: array(string()),
				lighters: array(string()),
				customLabel: pipe(
					string(),
					transform((input) => (input === "" ? undefined : input)),
				),
			}),
		},
		onSubmit: async ({ value, formApi }) => {
			dispatch(
				updateBeatmap({
					songId: sid,
					beatmapId: bid,
					changes: {
						...value,
						colorSchemeName: value.colorSchemeName === "" ? null : value.colorSchemeName,
						customLabel: value.customLabel === "" ? undefined : value.customLabel,
					},
				}),
			);

			formApi.reset(value);

			return APP_TOASTER.create({
				type: "success",
				description: "Successfully updated!",
			});
		},
	});

	const handleCopyBeatmap = useCallback(
		(id: BeatmapId, data: { characteristic: CharacteristicName; difficulty: DifficultyName }) => {
			dispatch(copyBeatmap({ songId: sid, sourceBeatmapId: bid, targetBeatmapId: id, changes: data }));
			return navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: id.toString() } });
		},
		[dispatch, navigate, sid, bid, view],
	);

	const handleDeleteBeatmap = useCallback<MouseEventHandler>(
		(ev) => {
			ev.preventDefault();

			if (!window.confirm("Are you sure you want to do this? This action cannot be undone.")) {
				return;
			}

			// Delete our working state
			const mutableDifficultiesCopy = { ...beatmaps };
			delete mutableDifficultiesCopy[bid];

			// Don't let the user delete the last difficulty!
			const remainingDifficultyIds = Object.keys(mutableDifficultiesCopy);
			if (remainingDifficultyIds.length === 0) {
				return APP_TOASTER.create({
					id: "last-difficulty",
					type: "error",
					description: "Sorry, you cannot delete the only remaining difficulty! Please create another difficulty first.",
				});
			}

			// If the user is currently editing the difficulty that they're trying to delete, let's redirect them to the next difficulty.
			const nextDifficultyId = remainingDifficultyIds[0];

			dispatch(removeBeatmap({ songId: sid, beatmapId: bid }));
			return navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: nextDifficultyId.toString() } });
		},
		[dispatch, navigate, sid, bid, view, beatmaps],
	);

	useBlocker({
		shouldBlockFn: () => (Form.state.isDirty ? !window.confirm(`You have unsaved changes! Are you sure you want to leave this page?\n\n(You tweaked a value for the "${bid}" beatmap)`) : false),
	});

	const colorSchemeIds = useAppSelector((state) => selectColorSchemeIds(state, sid));
	const COLOR_SCHEME_COLLECTION = useMemo(() => createColorSchemeCollection({ colorSchemeIds }), [colorSchemeIds]);

	return (
		<Form.AppForm>
			<Form.Root size="sm">
				<Stack gap={1}>
					<Heading rank={3}>{savedVersion.customLabel ?? bid}</Heading>
					<HStack gap={0}>
						<Interleave separator={({ index }) => <DotIcon key={index} size={16} />}>
							<Heading rank={4}>{CharacteristicRename[savedVersion.characteristic]}</Heading>
							<Heading rank={4}>{DifficultyRename[savedVersion.difficulty]}</Heading>
						</Interleave>
					</HStack>
				</Stack>
				<Stack gap={2}>
					<Form.Row>
						<Form.AppField name="noteJumpSpeed">{(ctx) => <ctx.NumberInput id={`${bid}.${ctx.name}`} label="Jump speed" />}</Form.AppField>
						<Form.AppField name="startBeatOffset">{(ctx) => <ctx.NumberInput id={`${bid}.${ctx.name}`} label="Jump offset" />}</Form.AppField>
					</Form.Row>
					<Form.AppField name="mappers">{(ctx) => <ctx.TagsInput id={`${bid}.${ctx.name}`} label="Mapper(s)" />}</Form.AppField>
					<Form.AppField name="lighters">{(ctx) => <ctx.TagsInput id={`${bid}.${ctx.name}`} label="Lighter(s)" />}</Form.AppField>
					<Collapsible
						open={showAdvancedControls}
						onOpenChange={(x) => setShowAdvancedControls(x.open)}
						render={() => (
							<Stack gap={2}>
								<Form.Row>
									<Form.AppField name="lightshowId">{(ctx) => <ctx.Input id={`${bid}.${ctx.name}`} label="Lightshow ID" />}</Form.AppField>
									<Form.AppField name="customLabel">{(ctx) => <ctx.Input id={`${bid}.${ctx.name}`} label="Custom label" />}</Form.AppField>
								</Form.Row>
								<Form.AppField name="environmentName">{(ctx) => <ctx.Select id={`${bid}.${ctx.name}`} label="Environment Override" helperText={"NOTE: This will only apply when exporting to v2 or later."} collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
								<Form.AppField name="colorSchemeName">{(ctx) => <ctx.Select id={`${bid}.${ctx.name}`} label="Color Scheme Override" helperText={"NOTE: This will only apply when exporting to v2 or later."} collection={COLOR_SCHEME_COLLECTION} />}</Form.AppField>
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
						unmountOnExit
						render={(ctx) => (
							<CreateBeatmapForm dialog={ctx} sid={sid} bid={bid} onSubmit={handleCopyBeatmap}>
								{() => "Copy beatmap"}
							</CreateBeatmapForm>
						)}
					>
						<Button variant="subtle" size="sm">
							Copy
						</Button>
					</Dialog>
					<Button variant="subtle" size="sm" colorPalette="red" onClick={handleDeleteBeatmap}>
						Delete
					</Button>
				</Wrap>
			</Form.Root>
		</Form.AppForm>
	);
}

export default UpdateBeatmapForm;
