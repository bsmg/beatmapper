import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import type { CharacteristicName, DifficultyName } from "bsmap";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";
import type { PropsWithChildren, ReactNode } from "react";
import { object } from "valibot";

import { createBeatmapCharacteristicListCollection, createBeatmapDifficultyListCollection } from "$/components/app/constants";
import { useSetupContext } from "$/components/context";
import { useAppForm } from "$/components/ui/compositions";
import { type createAppBeatmap, resolveBeatmapId } from "$/helpers/song.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectAllBeatmaps, selectBeatmapById, selectUsername } from "$/store/selectors";
import type { BeatmapId } from "$/types";

const SCHEMA = object({
	characteristic: CharacteristicNameSchema,
	difficulty: DifficultyNameSchema,
});

interface Props {
	dialog?: UseDialogContext;
	onSubmit: (bid: BeatmapId, data: Parameters<typeof createAppBeatmap>[0]) => void;
	children: (bid: BeatmapId | null) => ReactNode;
}
function CreateBeatmapForm({ dialog, onSubmit, children }: Assign<PropsWithChildren, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const navigate = useNavigate();

	const { toaster } = useSetupContext();

	const username = useAppSelector(selectUsername);
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
				const mappers = username ? [username] : [];
				onSubmit(beatmapId, { ...value, mappers: mappers, lighters: mappers });
				if (dialog) dialog.setOpen(false);
				navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: beatmapId } });
			} catch (error) {
				toaster?.error({ description: `Could not create beatmap: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	const beatmapId = useStore(Form.store, (state) => {
		if (!state.values.characteristic || !state.values.difficulty) return null;
		return resolveBeatmapId(state.values);
	});
	const selectedCharacteristic = useStore(Form.store, (state) => state.values.characteristic);

	return (
		<Form.AppForm>
			<Form.Root>
				<Form.AppField name="characteristic">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Characteristic" required collection={createBeatmapCharacteristicListCollection({ beatmaps })} onChange={() => Form.resetField("difficulty")} />}</Form.AppField>
				<Form.AppField name="difficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" required collection={createBeatmapDifficultyListCollection({ beatmaps, currentBeatmap, selectedCharacteristic })} />}</Form.AppField>
				<Form.Submit>{children(beatmapId)}</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateBeatmapForm;
