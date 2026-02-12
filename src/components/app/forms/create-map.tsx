import type { UseDialogContext } from "@ark-ui/react/dialog";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { useState } from "react";
import { gtValue, minLength, number, object, pipe, string, transform } from "valibot";

import { APP_TOASTER, CHARACTERISTIC_COLLECTION, COVER_ART_FILE_ACCEPT_TYPE, DIFFICULTY_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { Field, FileUpload, useAppForm } from "$/components/ui/compositions";
import { createSongId, resolveBeatmapId } from "$/helpers/song.helpers";
import { addSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds, selectUsername } from "$/store/selectors";

const SCHEMA = object({
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

	// These files are sent to the redux middleware.
	// We'll store them on disk (currently in indexeddb, but that may change), and capture a reference to them by a filename, which we'll store in redux.
	const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
	const [songFile, setSongFile] = useState<File | null>(null);

	const Form = useAppForm({
		defaultValues: {
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
			try {
				if (!songFile) {
					throw new Error("Please provide a valid song file.");
				}
				if (!coverArtFile) {
					throw new Error("Please provide a valid cover art file.");
				}

				const songId = createSongId(value);

				// Song IDs must be unique, and song IDs are generated from the name.
				// TODO: I could probably just append a `-2` or something, if this constraint turns out to be annoying in some cases
				if (currentSongIds.some((id) => id === songId)) {
					throw new Error("You already have a song with this name. Please choose a unique name.");
				}

				const beatmapId = resolveBeatmapId({ characteristic: value.characteristic, difficulty: value.difficulty });

				dispatch(addSong({ songId, beatmapId, name: value.name, subName: value.subName, artistName: value.artistName, bpm: value.bpm, offset: value.offset ?? 0, songFile, coverArtFile, username: username, selectedCharacteristic: value.characteristic, selectedDifficulty: value.difficulty }));

				if (dialog) dialog.setOpen(false);
			} catch (error) {
				APP_TOASTER.error({ description: error instanceof Error ? error.message : `Error creating map: See console for more information.` });
				console.error("Could not save files to local storage", error);
			}
		},
	});

	return (
		<Form.AppForm>
			<Form.Row>
				<Field label="Song File">
					<FileUpload label="Audio File" accept={SONG_FILE_ACCEPT_TYPE} acceptedFiles={songFile ? [songFile] : []} onFileAccept={(details) => setSongFile(details.files[0])} />
				</Field>
				<Field label="Cover Art File">
					<FileUpload label="Image File" accept={COVER_ART_FILE_ACCEPT_TYPE} acceptedFiles={coverArtFile ? [coverArtFile] : []} onFileAccept={(details) => setCoverArtFile(details.files[0])} />
				</Field>
			</Form.Row>
			<Form.Root>
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
