import { useBlocker, useNavigate } from "@tanstack/react-router";
import { type MouseEventHandler, useCallback, useMemo } from "react";

import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { deleteBeatmap, updateBeatmapMetadata } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { Stack, Wrap, styled } from "$:styled-system/jsx";
import { APP_TOASTER } from "$/components/app/constants";
import { Button, Dialog, Heading, useAppForm } from "$/components/ui/compositions";
import { number, object, pipe, string, transform } from "valibot";
import CopyDifficultyForm from "../CopyDifficultyForm";

interface Props {
	songId: SongId;
	difficultyId: BeatmapId;
}

const BeatmapSettings = ({ songId, difficultyId }: Props) => {
	const song = useAppSelector((state) => selectSongById(state, songId));
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const savedVersion = useMemo(() => song.difficultiesById[difficultyId], [song.difficultiesById, difficultyId]);

	const Form = useAppForm({
		defaultValues: {
			noteJumpSpeed: savedVersion.noteJumpSpeed,
			startBeatOffset: savedVersion.startBeatOffset,
			customLabel: savedVersion.customLabel ?? "",
		},
		validators: {
			onChange: object({
				noteJumpSpeed: number(),
				startBeatOffset: number(),
				customLabel: pipe(
					string(),
					transform((input) => (input === "" ? undefined : input)),
				),
			}),
		},
		onSubmit: async ({ value }) => {
			dispatch(updateBeatmapMetadata({ songId: songId, difficulty: difficultyId, noteJumpSpeed: value.noteJumpSpeed, startBeatOffset: value.startBeatOffset, customLabel: value.customLabel }));
		},
	});

	const handleCopyBeatmap = useCallback(
		(id: BeatmapId) => {
			navigate({ to: "/edit/$sid/$bid/details", params: { sid: songId.toString(), bid: id.toString() } });
		},
		[navigate, songId],
	);

	const handleDeleteBeatmap: MouseEventHandler = (ev) => {
		ev.preventDefault();

		const confirmed = window.confirm("Are you sure you want to do this? This action cannot be undone.");

		if (!confirmed) {
			return;
		}

		// Delete our working state
		const mutableDifficultiesCopy = { ...song.difficultiesById };
		delete mutableDifficultiesCopy[difficultyId];

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

		dispatch(deleteBeatmap({ songId: songId, difficulty: difficultyId }));

		return navigate({ to: "/edit/$sid/$bid/details", params: { sid: songId.toString(), bid: nextDifficultyId.toString() } });
	};

	const difficultyLabel = getLabelForDifficulty(difficultyId);

	useBlocker({
		shouldBlockFn: () => (Form.state.isDirty ? !window.confirm(`You have unsaved changes! Are you sure you want to leave this page?\n\n(You tweaked a value for the ${difficultyLabel} beatmap)`) : false),
	});

	return (
		<Wrapper>
			<Form.AppForm>
				<Form.Root>
					<Heading rank={3}>{difficultyLabel}</Heading>
					<Stack gap={2}>
						<Form.AppField name="noteJumpSpeed">{(ctx) => <ctx.Input id={`${difficultyId}.${ctx.name}`} label="Note jump speed" />}</Form.AppField>
						<Form.AppField name="startBeatOffset">{(ctx) => <ctx.Input id={`${difficultyId}.${ctx.name}`} label="Start beat offset" />}</Form.AppField>
						<Form.AppField name="customLabel">{(ctx) => <ctx.Input id={`${difficultyId}.${ctx.name}`} label="Custom label" />}</Form.AppField>
					</Stack>
					<Wrap gap={1}>
						<Form.Submit variant="subtle" size="sm">
							Save
						</Form.Submit>
						<Dialog title="Copy Beatmap" render={(ctx) => <CopyDifficultyForm dialog={ctx} songId={songId} idToCopy={difficultyId} afterCopy={handleCopyBeatmap} />}>
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
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		colorPalette: "slate",
		layerStyle: "fill.surface",
		padding: 3,
	},
});

export default BeatmapSettings;
