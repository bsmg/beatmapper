import type { UseDialogContext } from "@ark-ui/react/dialog";
import { CharacteristicNameSchema, DifficultyNameSchema } from "bsmap";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { useState } from "react";
import { gtValue, minLength, number, object, pipe, string, transform } from "valibot";

import { APP_TOASTER, CHARACTERISTIC_COLLECTION, COVER_ART_FILE_ACCEPT_TYPE, DIFFICULTY_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { Field, FileUpload, useAppForm } from "$/components/ui/compositions";
import { resolveSongId } from "$/helpers/song.helpers";
import { filestore } from "$/setup";
import { createNewSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds } from "$/store/selectors";

interface Props {
	dialog?: UseDialogContext;
}
function CreateMapForm({ dialog }: Props) {
	const currentSongIds = useAppSelector(selectSongIds);
	const dispatch = useAppDispatch();

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
			onChange: object({
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
			}),
		},
		onSubmit: async ({ value }) => {
			if (!coverArtFile) {
				return APP_TOASTER.create({
					type: "error",
					description: "Please select a cover art file first",
				});
			}
			if (!songFile) {
				return APP_TOASTER.create({
					type: "error",
					description: "Please select a song file first",
				});
			}

			const songId = resolveSongId({ name: value.name });

			// Song IDs must be unique, and song IDs are generated from the name.
			// TODO: I could probably just append a `-2` or something, if this constraint turns out to be annoying in some cases
			if (currentSongIds.some((id) => id === songId)) {
				return APP_TOASTER.create({
					id: "song-already-exists",
					type: "error",
					description: "You already have a song with this name. Please choose a unique name.",
				});
			}

			try {
				const { filename: coverArtFilename } = await filestore.saveCoverFile(songId, coverArtFile);
				const { filename: songFilename } = await filestore.saveSongFile(songId, songFile);

				await dispatch(createNewSong({ coverArtFilename, coverArtFile, songFilename, songFile, songId, name: value.name, subName: value.subName, artistName: value.artistName, bpm: value.bpm, offset: value.offset, selectedCharacteristic: value.characteristic, selectedDifficulty: value.difficulty }));

				if (dialog) dialog.setOpen(false);
			} catch (err) {
				console.error("Could not save files to local storage", err);
				return APP_TOASTER.create({
					description: "Error creating map. See console for more information.",
					type: "error",
				});
			}
		},
	});

	return (
		<Form.AppForm>
			<Form.Row>
				<Field label="Song File">
					<FileUpload accept={SONG_FILE_ACCEPT_TYPE} files={songFile ? [songFile] : []} onFileAccept={(details) => setSongFile(details.files[0])}>
						Audio File
					</FileUpload>
				</Field>
				<Field label="Cover Art File">
					<FileUpload accept={COVER_ART_FILE_ACCEPT_TYPE} files={coverArtFile ? [coverArtFile] : []} onFileAccept={(details) => setCoverArtFile(details.files[0])}>
						Image File
					</FileUpload>
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
				<Form.Submit>Create new song</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateMapForm;
