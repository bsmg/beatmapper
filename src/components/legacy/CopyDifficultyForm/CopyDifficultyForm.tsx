// TODO: Possibly dedupe with CreateDifficultyForm?
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useMemo } from "react";
import { object, pipe, string } from "valibot";

import { getLabelForDifficulty } from "$/helpers/song.helpers";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds } from "$/store/selectors";
import { type BeatmapId, Difficulty, type SongId } from "$/types";

import { createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { Text, useAppForm } from "$/components/ui/compositions";
import { copyDifficulty } from "$/store/actions";

interface Props {
	dialog?: UseDialogContext;
	songId: SongId;
	idToCopy: BeatmapId;
	afterCopy: (id: BeatmapId) => void;
}
const CopyDifficultyForm = ({ dialog, songId, idToCopy, afterCopy }: Props) => {
	const DIFFICULTIES = Object.values(Difficulty);
	const dispatch = useAppDispatch();
	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, songId));

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
			dispatch(copyDifficulty({ songId, fromDifficultyId: idToCopy, toDifficultyId: value.selectedDifficulty, afterCopy }));
			if (dialog) dialog.setOpen(false);
		},
	});

	// If we already have all difficulties, let the user know
	if (difficultyIds.length === DIFFICULTIES.length) {
		return <Text>You already have beatmaps for every difficulty, and you can only copy beatmaps for difficulties that don't yet exist. Please delete the beatmap for the difficulty you'd like to copy to.</Text>;
	}

	const DIFFICULTY_LIST_COLLECTION = useMemo(() => createBeatmapDifficultyListCollection({ beatmapIds: difficultyIds }), [difficultyIds]);

	return (
		<Form.AppForm>
			<Form.Root>
				<Text textStyle={"paragraph"}>
					Copy the <Text fontWeight={400}>{getLabelForDifficulty(idToCopy)}</Text> beatmap to another difficulty:
				</Text>
				<Form.AppField name="selectedDifficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" collection={DIFFICULTY_LIST_COLLECTION} />}</Form.AppField>
				<Form.Submit>Copy beatmap</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
};

export default CopyDifficultyForm;
