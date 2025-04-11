import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useMemo } from "react";
import { object, pipe, string } from "valibot";

import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { createDifficulty } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveBeatmapId, selectBeatmapIds } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { Text, useAppForm } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";

interface Props {
	dialog?: UseDialogContext;
	songId: SongId;
	afterCreate: (id: BeatmapId) => void;
}
const CreateDifficultyForm = ({ dialog, songId, afterCreate }: Props) => {
	const currentDifficulty = useAppSelector(selectActiveBeatmapId);
	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, songId));
	const dispatch = useAppDispatch();

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
			dispatch(createDifficulty({ songId, difficulty: value.selectedDifficulty, afterCreate }));
			if (dialog) dialog.setOpen(false);
		},
	});

	// If we already have all difficulties, let the user know
	if (difficultyIds.length === 5) {
		return <Text>You already have a beatmap for every available difficulty. You cannot create any more beatmaps for this song. Did you mean to select an existing difficulty?</Text>;
	}

	const DIFFICULTY_LIST_COLLECTION = useMemo(() => createBeatmapDifficultyListCollection({ beatmapIds: difficultyIds, currentBeatmapId: currentDifficulty ?? undefined }), [difficultyIds, currentDifficulty]);

	return (
		<Form.AppForm>
			<Form.Root>
				<Text>
					Select the difficulty you'd like to start creating. You can also copy an existing difficulty instead, on the{" "}
					<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
						<Link to={"/edit/$sid/$bid/details"} params={{ sid: songId.toString(), bid: currentDifficulty?.toString() }}>
							Song Details
						</Link>
					</Text>{" "}
					page.
				</Text>
				<Form.AppField name="selectedDifficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" collection={DIFFICULTY_LIST_COLLECTION} />}</Form.AppField>
				<Form.Submit>
					<Form.Subscribe>{(ctx) => `Create ${ctx.values.selectedDifficulty && getLabelForDifficulty(ctx.values.selectedDifficulty)} beatmap`}</Form.Subscribe>
				</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
};

export default CreateDifficultyForm;
