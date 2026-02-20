import type { UseDialogContext } from "@ark-ui/react/dialog";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { array, file, gtValue, minLength, nonEmpty, number, object, pipe, string, transform } from "valibot";

import { CHARACTERISTIC_COLLECTION, COVER_ART_FILE_ACCEPT_TYPE, DIFFICULTY_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useAppForm } from "$/components/ui/compositions";
import { createSongId, resolveBeatmapId } from "$/helpers/song.helpers";
import { getAppToaster } from "$/setup";
import { addSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds, selectUsername } from "$/store/selectors";

const SCHEMA = object({
	songFile: pipe(array(file()), nonEmpty("You must provide exactly one file.")),
	coverArtFile: pipe(array(file()), nonEmpty("You must provide exactly one file.")),
	name: pipe(string(), minLength(1)),
	subName: pipe(string()),
	artistName: pipe(string(), minLength(1)),
	bpm: pipe(number(), gtValue(0)),
	offset: pipe(
		number(),
		transform((input) => (Number.isNaN(input) ? undefined : input)),
	),
	characteristic: CharacteristicNameSchema,
	difficulty: DifficultyNameSchema,
});

interface Props {
	dialog?: UseDialogContext;
}
function CreateMapForm({ dialog }: Props) {
	const dispatch = useAppDispatch();
	const currentSongIds = useAppSelector(selectSongIds);
	const username = useAppSelector(selectUsername);

	const Form = useAppForm({
		defaultValues: {
			songFile: [] as File[],
			coverArtFile: [] as File[],
			name: "",
			subName: "",
			artistName: "",
			bpm: 120,
			offset: 0,
			characteristic: "Standard" as CharacteristicName,
			difficulty: "Easy" as DifficultyName,
		},
		validators: {
			onMount: SCHEMA,
			onChange: SCHEMA,
			onSubmit: SCHEMA,
		},
		onSubmit: async ({ value }) => {
			const toaster = getAppToaster();

			try {
				const songId = createSongId(value);

				// Song IDs must be unique, and song IDs are generated from the name.
				// TODO: I could probably just append a `-2` or something, if this constraint turns out to be annoying in some cases
				if (currentSongIds.some((id) => id === songId)) {
					throw new Error("You already have a song with this name. Please choose a unique name.");
				}

				const beatmapId = resolveBeatmapId({ characteristic: value.characteristic, difficulty: value.difficulty });

				dispatch(
					addSong({
						songId,
						beatmapId,
						name: value.name,
						subName: value.subName,
						artistName: value.artistName,
						bpm: value.bpm,
						offset: value.offset ?? 0,
						songFile: value.songFile[0],
						coverArtFile: value.coverArtFile[0],
						username: username,
						selectedCharacteristic: value.characteristic,
						selectedDifficulty: value.difficulty,
					}),
				);

				if (dialog) dialog.setOpen(false);
			} catch (error) {
				toaster?.error({ description: error instanceof Error ? error.message : `Error creating map: See console for more information.` });
				console.error("Could not save files to local storage", error);
			}
		},
	});

	return (
		<Form.AppForm>
			<Form.Root>
				<Form.Row>
					<Form.AppField name="songFile">{(ctx) => <ctx.FileUpload label="Song File" maxFiles={1} acceptText="Audio File" accept={SONG_FILE_ACCEPT_TYPE} />}</Form.AppField>
					<Form.AppField name="coverArtFile">{(ctx) => <ctx.FileUpload label="Cover Art File" maxFiles={1} acceptText="Image File" accept={COVER_ART_FILE_ACCEPT_TYPE} />}</Form.AppField>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="name">{(ctx) => <ctx.Input label="Song Title" required />}</Form.AppField>
					<Form.AppField name="subName">{(ctx) => <ctx.Input label="Song Subtitle" />}</Form.AppField>
					<Form.AppField name="artistName">{(ctx) => <ctx.Input label="Artist Name" required />}</Form.AppField>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" required />}</Form.AppField>
					<Form.AppField name="offset">{(ctx) => <ctx.NumberInput label="Editor Offset" placeholder="0" />}</Form.AppField>
				</Form.Row>
				<Form.AppField name="characteristic">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Characteristic" required collection={CHARACTERISTIC_COLLECTION} />}</Form.AppField>
				<Form.AppField name="difficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" required collection={DIFFICULTY_COLLECTION} />}</Form.AppField>
				<Form.Submit>Create new map</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateMapForm;
