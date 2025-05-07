import type { UseDialogContext } from "@ark-ui/react/dialog";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { type ReactNode, useMemo } from "react";
import { object } from "valibot";

import { useAppSelector } from "$/store/hooks";
import { selectAllBeatmaps, selectBeatmapById } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { APP_TOASTER, createBeatmapCharacteristicListCollection, createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { useAppForm } from "$/components/ui/compositions";
import { DIFFICULTIES } from "$/constants";
import { resolveBeatmapId } from "$/helpers/song.helpers";
import { useStore } from "@tanstack/react-form";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";

interface Props {
	dialog?: UseDialogContext;
	sid: SongId;
	bid?: BeatmapId;
	onSubmit: (bid: BeatmapId, data: { characteristic: CharacteristicName; difficulty: DifficultyName }) => void;
	children: (beatmap: { id: BeatmapId }) => ReactNode;
}
function CreateBeatmapForm({ dialog, sid, bid, onSubmit: afterCreate, children }: Props) {
	const beatmaps = useAppSelector((state) => selectAllBeatmaps(state, sid));
	const currentBeatmap = useAppSelector((state) => (bid ? selectBeatmapById(state, sid, bid) : undefined));

	const Form = useAppForm({
		defaultValues: {
			characteristic: "" as CharacteristicName,
			difficulty: "" as DifficultyName,
		},
		validators: {
			onChange: object({
				characteristic: CharacteristicNameSchema,
				difficulty: DifficultyNameSchema,
			}),
		},
		onSubmit: async ({ value }) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === value.characteristic);
			if (withMatchingCharacteristic.length >= DIFFICULTIES.length) {
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

	const CHARACTERISTIC_LIST_COLLECTION = useMemo(() => createBeatmapCharacteristicListCollection({ beatmaps, currentBeatmap }), [beatmaps, currentBeatmap]);
	const DIFFICULTY_LIST_COLLECTION = useMemo(() => createBeatmapDifficultyListCollection({ beatmaps, currentBeatmap, selectedCharacteristic: selectedCharacteristic }), [beatmaps, currentBeatmap, selectedCharacteristic]);

	return (
		<Form.AppForm>
			<Form.Root>
				<Form.AppField name="characteristic">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Characteristic" collection={CHARACTERISTIC_LIST_COLLECTION} />}</Form.AppField>
				<Form.AppField name="difficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" collection={DIFFICULTY_LIST_COLLECTION} />}</Form.AppField>
				<Form.Submit>
					<Form.Subscribe>{(ctx) => children({ id: ctx.values.difficulty })}</Form.Subscribe>
				</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateBeatmapForm;
