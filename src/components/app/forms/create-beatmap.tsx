import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import type { PropsWithChildren } from "react";
import { type InferOutput, object } from "valibot";

import { createBeatmapCharacteristicListCollection, createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { useSetupContext } from "$/components/context";
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
	onSubmit: (bid: BeatmapId, data: InferOutput<typeof SCHEMA>) => void;
}
function CreateBeatmapForm({ children = "Create", dialog, onSubmit }: Assign<PropsWithChildren, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const { toaster } = useSetupContext();

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
		onSubmit: ({ value }) => {
			try {
				const beatmapId = resolveBeatmapId(value);
				onSubmit(beatmapId, value);
				if (dialog) dialog.setOpen(false);
			} catch (error) {
				toaster?.error({ description: `Could not create beatmap: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	const selectedCharacteristic = useStore(Form.store, (state) => state.values.characteristic);

	return (
		<Form.AppForm>
			<Form.Root>
				<Form.AppField name="characteristic">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Characteristic" required collection={createBeatmapCharacteristicListCollection({ beatmaps })} onChange={() => Form.resetField("difficulty")} />}</Form.AppField>
				<Form.AppField name="difficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" required collection={createBeatmapDifficultyListCollection({ beatmaps, currentBeatmap, selectedCharacteristic })} />}</Form.AppField>
				<Form.Submit>{children}</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateBeatmapForm;
