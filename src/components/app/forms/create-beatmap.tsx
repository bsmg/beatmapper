import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { type ReactNode, useMemo } from "react";
import { object } from "valibot";

import { APP_TOASTER, createBeatmapCharacteristicListCollection, createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { useAppForm } from "$/components/ui/compositions";
import { resolveBeatmapId } from "$/helpers/song.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectAllBeatmaps, selectBeatmapById } from "$/store/selectors";
import type { BeatmapId } from "$/types";

const SCHEMA = object({
	characteristic: CharacteristicNameSchema,
	difficulty: DifficultyNameSchema,
});

interface Props {
	dialog?: UseDialogContext;
	onSubmit: (bid: BeatmapId, data: { characteristic: CharacteristicName; difficulty: DifficultyName }) => void;
	children: (beatmap: { id: BeatmapId }) => ReactNode;
}
function CreateBeatmapForm({ dialog, onSubmit: afterCreate, children }: Props) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const beatmaps = useAppSelector((state) => selectAllBeatmaps(state, sid));
	const currentBeatmap = useAppSelector((state) => selectBeatmapById(state, sid, bid));

	const Form = useAppForm({
		defaultValues: {
			characteristic: null as unknown as CharacteristicName,
			difficulty: null as unknown as DifficultyName,
		},
		validators: {
			onMount: SCHEMA,
			onChange: SCHEMA,
			onSubmit: SCHEMA,
		},
		onSubmit: async ({ value }) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === value.characteristic);
			if (withMatchingCharacteristic.length >= DIFFICULTY_LIST_COLLECTION.size) {
				return APP_TOASTER.create({
					id: "all-difficulties-exist",
					type: "error",
					description: "All difficulties currently exist for this characteristic. Please choose a different characteristic.",
				});
			}
			const withMatchingDifficulty = withMatchingCharacteristic.some((beatmap) => beatmap.difficulty === value.difficulty);
			if (withMatchingDifficulty) {
				return APP_TOASTER.create({
					id: "difficulty-exists",
					type: "error",
					description: "The selected difficulty already exists for this characteristic. Please choose a different difficulty.",
				});
			}

			const beatmapId = resolveBeatmapId(value);
			afterCreate(beatmapId, value);
			if (dialog) dialog.setOpen(false);
		},
	});

	const selectedCharacteristic = useStore(Form.store, (state) => state.values.characteristic);

	const CHARACTERISTIC_LIST_COLLECTION = useMemo(() => createBeatmapCharacteristicListCollection({ beatmaps }), [beatmaps]);
	const DIFFICULTY_LIST_COLLECTION = useMemo(() => createBeatmapDifficultyListCollection({ beatmaps, currentBeatmap, selectedCharacteristic: selectedCharacteristic }), [beatmaps, currentBeatmap, selectedCharacteristic]);

	return (
		<Form.AppForm>
			<Form.Root>
				<Form.AppField name="characteristic">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Characteristic" required collection={CHARACTERISTIC_LIST_COLLECTION} />}</Form.AppField>
				<Form.AppField name="difficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" required collection={DIFFICULTY_LIST_COLLECTION} />}</Form.AppField>
				<Form.Submit>
					<Form.Subscribe>{(ctx) => children({ id: ctx.values.difficulty })}</Form.Subscribe>
				</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateBeatmapForm;
