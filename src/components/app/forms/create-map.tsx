import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { type CharacteristicName, CharacteristicNameSchema, type DifficultyName, DifficultyNameSchema, EnvironmentName, type EnvironmentV2Name, type EnvironmentV3Name } from "bsmap";
import { useState } from "react";
import { array, custom, file, gtValue, length, minLength, number, object, pipe, string, transform } from "valibot";

import { CHARACTERISTIC_COLLECTION, COVER_ART_FILE_ACCEPT_TYPE, DIFFICULTY_COLLECTION, ENVIRONMENT_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useSetupContext } from "$/components/context";
import { Show } from "$/components/ui/atoms";
import { Audio, Switch, useAppForm } from "$/components/ui/compositions";
import { createSongId, resolveBeatmapId } from "$/helpers/song.helpers";
import { addSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds, selectSongVolume, selectUsername } from "$/store/selectors";

const SCHEMA = object({
	songFile: pipe(array(file()), length(1, "You must provide exactly one file.")),
	coverArtFile: pipe(array(file()), length(1, "You must provide exactly one file.")),
	name: pipe(string(), minLength(1)),
	subName: pipe(string()),
	artistName: pipe(string()),
	bpm: pipe(number(), gtValue(0)),
	offset: pipe(
		number(),
		transform((input) => (Number.isNaN(input) ? undefined : input)),
	),
	previewStartTime: pipe(number()),
	previewDuration: pipe(number()),
	environment: custom<EnvironmentV2Name | EnvironmentV3Name>((name) => typeof name === "string" && name.endsWith("Environment"), 'Invalid environment name: Must end with "Environment" as the suffix.'),
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
				const songId = createSongId(value);

				// Song IDs must be unique, and song IDs are generated from the name.
				// TODO: I could probably just append a `-2` or something, if this constraint turns out to be annoying in some cases
				if (currentSongIds.some((id) => id === songId)) {
					throw new Error("You already have a song with this name. Please choose a unique name.");
				}

				const beatmapId = resolveBeatmapId({ characteristic: value.characteristic, difficulty: value.difficulty });

				const songFile = value.songFile[0];
				const coverArtFile = value.coverArtFile[0];
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
				<Form.Row>
					<Form.AppField name="songFile">
						{(ctx) => (
							<ctx.FileUpload label="Song File" required maxFiles={1} acceptText="Audio File" accept={SONG_FILE_ACCEPT_TYPE}>
								{(file) => <Audio file={file} startTime={previewStartTime} duration={previewDuration} volume={volume} />}
							</ctx.FileUpload>
						)}
					</Form.AppField>
					<Form.AppField name="coverArtFile">
						{(ctx) => (
							<ctx.FileUpload label="Cover Art File" required maxFiles={1} acceptText="Image File" accept={COVER_ART_FILE_ACCEPT_TYPE}>
								{() => null}
							</ctx.FileUpload>
						)}
					</Form.AppField>
				</Form.Row>
				<Show when={!showOptionalFields}>
					<Form.Row>
						<Form.AppField name="name">{(ctx) => <ctx.Input label="Song Title" required />}</Form.AppField>
						<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" required />}</Form.AppField>
					</Form.Row>
				</Show>
				<Show when={showOptionalFields}>
					<Form.Row>
						<Form.AppField name="name">{(ctx) => <ctx.Input label="Song Title" required />}</Form.AppField>
						<Form.AppField name="subName">{(ctx) => <ctx.Input label="Song Subtitle" />}</Form.AppField>
						<Form.AppField name="artistName">{(ctx) => <ctx.Input label="Song Artist(s)" />}</Form.AppField>
					</Form.Row>
					<Form.Row>
						<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" required />}</Form.AppField>
						<Form.AppField name="offset">{(ctx) => <ctx.NumberInput label="Editor Offset" placeholder="0" />}</Form.AppField>
						<Form.AppField name="previewStartTime">{(ctx) => <ctx.NumberInput label="Preview start time" placeholder="(in seconds)" />}</Form.AppField>
						<Form.AppField name="previewDuration">{(ctx) => <ctx.NumberInput label="Preview duration" placeholder="(in seconds)" />}</Form.AppField>
					</Form.Row>
					<Form.Row>
						<Form.AppField name="environment">{(ctx) => <ctx.Combobox label="Base Environment" helperText={"If a newer environment is not available to select, simply create a new entry in the combobox."} creatable collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
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
