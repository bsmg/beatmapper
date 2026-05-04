import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { type CharacteristicName, CharacteristicNameSchema, type DifficultyName, DifficultyNameSchema, EnvironmentName, type EnvironmentV2Name, type EnvironmentV3Name } from "bsmap";
import { useState } from "react";
import { array, endsWith, file, type GenericSchema, gtValue, length, maxLength, minLength, minValue, number, object, pipe, string, transform } from "valibot";

import { CHARACTERISTIC_COLLECTION, COVER_ART_FILE_ACCEPT_TYPE, DIFFICULTY_COLLECTION, ENVIRONMENT_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useSetupContext } from "$/components/context";
import { Show } from "$/components/ui/atoms";
import { Audio, Switch, useAppForm } from "$/components/ui/compositions";
import { createPlaceholderImageFile, remuxImageToSquare } from "$/helpers/file.helpers";
import { createSongId, resolveBeatmapId } from "$/helpers/song.helpers";
import { addSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds, selectSongVolume, selectUsername } from "$/store/selectors";

const SCHEMA = object({
	songFile: pipe(array(file()), length(1)),
	coverArtFile: pipe(array(file()), maxLength(1)),
	name: pipe(string(), minLength(1)),
	subName: pipe(string()),
	artistName: pipe(string()),
	bpm: pipe(number(), gtValue(0)),
	offset: pipe(
		number(),
		minValue(0),
		transform((input) => (Number.isNaN(input) ? undefined : input)),
	),
	previewStartTime: pipe(number(), minValue(0)),
	previewDuration: pipe(number(), minValue(0)),
	environment: pipe(string(), endsWith("Environment")) as GenericSchema<EnvironmentV2Name | EnvironmentV3Name>,
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
	const volume = useAppSelector(selectSongVolume);

	const { toaster } = useSetupContext();

	const Form = useAppForm({
		defaultValues: {
			songFile: [] as File[],
			coverArtFile: [] as File[],
			name: "",
			subName: "",
			artistName: "",
			bpm: 0,
			offset: 0,
			previewStartTime: 12,
			previewDuration: 10,
			environment: EnvironmentName[0] as EnvironmentV2Name | EnvironmentV3Name,
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
				const songId = createSongId(value, currentSongIds);
				const beatmapId = resolveBeatmapId({ characteristic: value.characteristic, difficulty: value.difficulty });

				const songFile = value.songFile[0];
				const coverArtFile = value.coverArtFile[0] ?? (await createPlaceholderImageFile());

				const mappers = username !== "" ? [username] : [];

				dispatch(
					addSong({
						songId,
						beatmapId,
						songFile,
						coverArtFile,
						songData: {
							id: songId,
							name: value.name,
							subName: value.subName,
							artistName: value.artistName,
							bpm: value.bpm,
							offset: value.offset ?? 0,
							previewStartTime: value.previewStartTime,
							previewDuration: value.previewDuration,
							environment: value.environment,
							songFilename: songFile.name,
							coverArtFilename: coverArtFile.name,
						},
						beatmapData: {
							characteristic: value.characteristic,
							difficulty: value.difficulty,
							mappers: mappers,
							lighters: mappers,
						},
					}),
				);

				if (dialog) dialog.setOpen(false);
			} catch (error) {
				toaster?.error({ description: `Could not create map: ${error instanceof Error ? error.message : "See console for more information."}` });
				return console.error(error);
			}
		},
	});

	const previewStartTime = useStore(Form.store, (state) => state.values.previewStartTime);
	const previewDuration = useStore(Form.store, (state) => state.values.previewDuration);

	const [showOptionalFields, setShowOptionalFields] = useState(false);

	return (
		<Form.AppForm>
			<Form.Root>
				<Switch label="Show Optional Fields" checked={showOptionalFields} onCheckedChange={(x) => setShowOptionalFields(!!x.checked)} />
				<Show when={!showOptionalFields}>
					<Form.AppField name="songFile">
						{(ctx) => (
							<ctx.FileUpload label="Song File" required acceptText="Audio File" accept={SONG_FILE_ACCEPT_TYPE} maxFiles={1}>
								{(file) => <Audio file={file} startTime={previewStartTime} duration={previewDuration} volume={volume} />}
							</ctx.FileUpload>
						)}
					</Form.AppField>

					<Form.Row>
						<Form.AppField name="name">{(ctx) => <ctx.Input label="Song Title" required />}</Form.AppField>
						<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" min={0} required />}</Form.AppField>
					</Form.Row>
				</Show>
				<Show when={showOptionalFields}>
					<Form.Row>
						<Form.AppField name="songFile">
							{(ctx) => (
								<ctx.FileUpload label="Song File" required acceptText="Audio File" accept={SONG_FILE_ACCEPT_TYPE} maxFiles={1}>
									{(file) => <Audio file={file} startTime={previewStartTime} duration={previewDuration} volume={volume} />}
								</ctx.FileUpload>
							)}
						</Form.AppField>
						<Form.AppField name="coverArtFile">
							{(ctx) => (
								<ctx.FileUpload label="Cover Art File" acceptText="Image File" accept={COVER_ART_FILE_ACCEPT_TYPE} maxFiles={1} transformFiles={(files) => Promise.all(files.map((file) => remuxImageToSquare(file)))}>
									{() => null}
								</ctx.FileUpload>
							)}
						</Form.AppField>
					</Form.Row>

					<Form.Row>
						<Form.AppField name="name">{(ctx) => <ctx.Input label="Song Title" required />}</Form.AppField>
						<Form.AppField name="subName">{(ctx) => <ctx.Input label="Song Subtitle" />}</Form.AppField>
						<Form.AppField name="artistName">{(ctx) => <ctx.Input label="Song Artist(s)" />}</Form.AppField>
					</Form.Row>
					<Form.Row>
						<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" required min={0} />}</Form.AppField>
						<Form.AppField name="offset">{(ctx) => <ctx.NumberInput label="Editor Offset" required />}</Form.AppField>
						<Form.AppField name="previewStartTime">{(ctx) => <ctx.NumberInput label="Preview start time" required min={0} />}</Form.AppField>
						<Form.AppField name="previewDuration">{(ctx) => <ctx.NumberInput label="Preview duration" required min={0} />}</Form.AppField>
					</Form.Row>
					<Form.Row>
						<Form.AppField name="environment">{(ctx) => <ctx.Combobox label="Base Environment" required creatable collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
					</Form.Row>
				</Show>
				<Form.AppField name="characteristic">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Characteristic" required collection={CHARACTERISTIC_COLLECTION} />}</Form.AppField>
				<Form.AppField name="difficulty">{(ctx) => <ctx.RadioButtonGroup label="Beatmap Difficulty" required collection={DIFFICULTY_COLLECTION} />}</Form.AppField>
				<Form.Submit>Create new map</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default CreateMapForm;
