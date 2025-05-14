import { useBlocker, useNavigate } from "@tanstack/react-router";
import { type MouseEventHandler, useCallback, useState } from "react";
import { number, object, pipe, string, transform } from "valibot";

import { copyDifficulty, deleteBeatmap, updateBeatmapMetadata } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapById, selectBeatmaps } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { Stack, Wrap } from "$:styled-system/jsx";
import { APP_TOASTER } from "$/components/app/constants";
import { CreateBeatmapForm } from "$/components/app/forms";
import { Button, Collapsible, Dialog, Heading, useAppForm } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function UpdateBeatmapForm({ sid, bid }: Props) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const beatmaps = useAppSelector((state) => selectBeatmaps(state, sid));
	const savedVersion = useAppSelector((state) => selectBeatmapById(state, sid, bid));

	const [showAdvancedControls, setShowAdvancedControls] = useState(false);

	const Form = useAppForm({
		defaultValues: {
			lightshowId: savedVersion.lightshowId.toString(),
			noteJumpSpeed: savedVersion.noteJumpSpeed,
			startBeatOffset: savedVersion.startBeatOffset,
			customLabel: savedVersion.customLabel ?? "",
		},
		validators: {
			onChange: object({
				lightshowId: string(),
				noteJumpSpeed: number(),
				startBeatOffset: number(),
				customLabel: pipe(
					string(),
					transform((input) => (input === "" ? undefined : input)),
				),
			}),
		},
		onSubmit: async ({ value, formApi }) => {
			dispatch(updateBeatmapMetadata({ songId: sid, beatmapId: bid, beatmapData: value }));

			formApi.reset(value);

			return APP_TOASTER.create({
				type: "success",
				description: "Successfully updated!",
			});
		},
	});

	const handleCopyBeatmap = useCallback(
		(id: BeatmapId) => {
			dispatch(copyDifficulty({ songId: sid, fromBeatmapId: bid, toBeatmapId: id }));
		},
		[dispatch, sid, bid],
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

			dispatch(deleteBeatmap({ songId: sid, beatmapId: bid }));

			return navigate({ to: "/edit/$sid/$bid/details", params: { sid: sid.toString(), bid: nextDifficultyId.toString() } });
		},
		[navigate, dispatch, beatmaps, sid, bid],
	);

	useBlocker({
		shouldBlockFn: () => (Form.state.isDirty ? !window.confirm(`You have unsaved changes! Are you sure you want to leave this page?\n\n(You tweaked a value for the "${bid}" beatmap)`) : false),
	});

	return (
		<Form.AppForm>
			<Form.Root size="sm">
				<Heading rank={3}>{bid}</Heading>
				<Stack gap={2}>
					<Form.AppField name="noteJumpSpeed">{(ctx) => <ctx.NumberInput id={`${bid}.${ctx.name}`} label="Note jump speed" />}</Form.AppField>
					<Form.AppField name="startBeatOffset">{(ctx) => <ctx.NumberInput id={`${bid}.${ctx.name}`} label="Start beat offset" />}</Form.AppField>
					<Form.AppField name="customLabel">{(ctx) => <ctx.Input id={`${bid}.${ctx.name}`} label="Custom label" />}</Form.AppField>
					<Collapsible
						open={showAdvancedControls}
						onOpenChange={(x) => setShowAdvancedControls(x.open)}
						render={() => (
							<Stack gap={2}>
								<Form.AppField name="lightshowId">{(ctx) => <ctx.Input id={`${bid}.${ctx.name}`} label="Lightshow Id" />}</Form.AppField>
							</Stack>
						)}
					>
						<Button size="sm" variant="subtle" stretch>
							Show Advanced Settings
						</Button>
					</Collapsible>
				</Stack>
				<Wrap gap={1}>
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
