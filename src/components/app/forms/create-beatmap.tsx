import type { UseDialogContext } from "@ark-ui/react/dialog";
import { type ReactNode, useMemo } from "react";
import { object, pipe, string } from "valibot";

import { useAppSelector } from "$/store/hooks";
import { selectBeatmapIds } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { Text, useAppForm } from "$/components/ui/compositions";

interface Props {
	dialog?: UseDialogContext;
	sid: SongId;
	bid?: BeatmapId;
	onSubmit: (bid: BeatmapId) => void;
	children: (beatmap: { id: BeatmapId }) => ReactNode;
}
function CreateBeatmapForm({ dialog, sid, bid, onSubmit: afterCreate, children }: Props) {
	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, sid));

	const Form = useAppForm({
		defaultValues: {
			selectedDifficulty: "",
		},
		validators: {
			onChange: object({
				selectedDifficulty: pipe(string()),
			}),
		},
		onSubmit: async ({ value }) => {
			afterCreate(value.selectedDifficulty);
			if (dialog) dialog.setOpen(false);
		},
	});

	// If we already have all difficulties, let the user know
	if (difficultyIds.length === 5) {
		return <Text>You already have a beatmap for every available difficulty. You cannot create any more beatmaps for this song. Did you mean to select an existing difficulty?</Text>;
	}

	const DIFFICULTY_LIST_COLLECTION = useMemo(() => createBeatmapDifficultyListCollection({ beatmapIds: difficultyIds, currentBeatmapId: bid ?? undefined }), [difficultyIds, bid]);

	return (
		<Form.AppForm>
			<Form.Root>
				<Form.AppField name="selectedDifficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" collection={DIFFICULTY_LIST_COLLECTION} />}</Form.AppField>
				<Form.Submit>
					<Form.Subscribe>{(ctx) => children({ id: ctx.values.selectedDifficulty })}</Form.Subscribe>
				</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateBeatmapForm;
