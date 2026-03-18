import { useDialog } from "@ark-ui/react/dialog";
import { useStore } from "@tanstack/react-form";
import { useBlocker, useParams } from "@tanstack/react-router";
import type { EnvironmentV2Name, EnvironmentV3Name } from "bsmap";
import { custom, gtValue, number, object, pipe, string, transform } from "valibot";

import { COVER_ART_FILE_ACCEPT_TYPE, ENVIRONMENT_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useLocalFileMutation, useLocalFileQuery } from "$/components/app/hooks/local-file.hooks";
import { useSetupContext } from "$/components/context";
import { AlertDialogProvider, Audio, Field, FileUpload, useAppForm } from "$/components/ui/compositions";
import { remuxImageToSquare } from "$/helpers/file.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { updateSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById, selectSongVolume } from "$/store/selectors";
import { Text } from "$:styled-system/jsx";

const SCHEMA = object({
	name: pipe(string()),
	subName: pipe(string()),
	artistName: pipe(string()),
	bpm: pipe(number(), gtValue(0, "Value must be greater than 0")),
	offset: pipe(
		number(),
		transform((input) => (Number.isNaN(input) ? undefined : input)),
	),
	swingAmount: pipe(
		number(),
		transform(() => 0.5),
	),
	swingPeriod: pipe(
		number(),
		transform(() => 0),
	),
	previewStartTime: pipe(number(), gtValue(0, "Value must be greater than 0")),
	previewDuration: pipe(number(), gtValue(0, "Value must be greater than 0")),
	environment: custom<EnvironmentV2Name | EnvironmentV3Name>((name) => typeof name === "string" && name.endsWith("Environment"), 'Value must end with "Environment"'),
});

function UpdateSongForm() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const { filestore, toaster } = useSetupContext();

	const dispatch = useAppDispatch();
	const song = useAppSelector((state) => selectSongById(state, sid));
	const volume = useAppSelector(selectSongVolume);

	const { data: acceptedSongFile } = useLocalFileQuery(BeatmapFilestore.resolveFilename(sid, "song", {}), {
		queryKey: ["file-upload"],
		transformFile: (file) => (file ? [file] : []),
	});
	const { data: acceptedCoverArtFile } = useLocalFileQuery(BeatmapFilestore.resolveFilename(sid, "cover", {}), {
		queryKey: ["file-upload"],
		transformFile: (file) => (file ? [file] : []),
	});

	const { mutate: handleAcceptSongFile } = useLocalFileMutation(BeatmapFilestore.resolveFilename(sid, "song", {}), {
		onSuccess: () => {
			toaster?.success({ id: "song-file-accepted", description: "Successfully updated song file!" });
		},
	});
	const { mutate: handleAcceptCoverArtFile } = useLocalFileMutation(BeatmapFilestore.resolveFilename(sid, "cover", {}), {
		onSuccess: () => {
			toaster?.success({ id: "cover-art-file-accepted", description: "Successfully updated cover art file!" });
		},
	});

	const Form = useAppForm({
		defaultValues: {
			name: song.name ?? "",
			subName: song.subName ?? "",
			artistName: song.artistName ?? "",
			bpm: song.bpm ?? 120,
			offset: song.offset ?? 0,
			swingAmount: song.swingAmount ?? 0,
			swingPeriod: song.swingPeriod ?? 0,
			previewStartTime: song.previewStartTime ?? 12,
			previewDuration: song.previewDuration ?? 10,
			environment: song.environment,
		},
		validators: {
			onMount: SCHEMA,
			onChange: SCHEMA,
			onSubmit: SCHEMA,
		},
		onSubmit: async ({ value, formApi }) => {
			try {
				const newSongObject = { ...song, ...value };

				if (acceptedCoverArtFile) {
					const { filename: coverArtFilename } = await filestore.saveCoverArtFile(sid, acceptedCoverArtFile[0]);
					newSongObject.coverArtFilename = coverArtFilename;
				}

				if (acceptedSongFile) {
					const { filename: songFilename } = await filestore.saveSongFile(sid, acceptedSongFile[0]);
					newSongObject.songFilename = songFilename;
				}

				// Update our redux state
				dispatch(updateSong({ songId: sid, songFile: acceptedSongFile?.[0], changes: newSongObject }));

				formApi.reset(value);
			} catch (error) {
				toaster?.error({ description: `Could not update song: ${error instanceof Error ? error.message : "See console for more information."}` });
				return console.error(error);
			}
		},
	});

	const previewStartTime = useStore(Form.store, (state) => state.values.previewStartTime);
	const previewDuration = useStore(Form.store, (state) => state.values.previewDuration);

	const { proceed, reset, status } = useBlocker({
		shouldBlockFn: () => Form.state.isDirty,
		withResolver: true,
	});

	const isDirtyAlert = useDialog({ role: "alertdialog", open: status === "blocked" });

	return (
		<Form.AppForm>
			{status === "blocked" && <AlertDialogProvider value={isDirtyAlert} render={() => <Text textStyle={"paragraph"}>You have unsaved changes! Are you sure you want to leave this page?</Text>} onSubmit={proceed} onCancel={reset} />}
			<Form.Root>
				<Form.Row>
					<Field label="Song File" required>
						<FileUpload label="Audio File" deletable={false} accept={SONG_FILE_ACCEPT_TYPE} maxFiles={1} acceptedFiles={acceptedSongFile} onFileAccept={(details) => handleAcceptSongFile(details.files[0])}>
							{(file) => <Audio file={file} startTime={previewStartTime} duration={previewDuration} volume={volume} />}
						</FileUpload>
					</Field>
					<Field label="Cover Art File" required>
						<FileUpload label="Image File" deletable={false} accept={COVER_ART_FILE_ACCEPT_TYPE} maxFiles={1} acceptedFiles={acceptedCoverArtFile} onFileAccept={(details) => handleAcceptCoverArtFile(details.files[0])} transformFiles={(files) => Promise.all(files.map(remuxImageToSquare))}>
							{() => null}
						</FileUpload>
					</Field>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="name">{(ctx) => <ctx.Input label="Song Title" required />}</Form.AppField>
					<Form.AppField name="subName">{(ctx) => <ctx.Input label="Song Subtitle" />}</Form.AppField>
					<Form.AppField name="artistName">{(ctx) => <ctx.Input label="Song Artist(s)" required />}</Form.AppField>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" required min={0} />}</Form.AppField>
					<Form.AppField name="offset">{(ctx) => <ctx.NumberInput label="Editor Offset" required placeholder="0" />}</Form.AppField>
					<Form.AppField name="previewStartTime">{(ctx) => <ctx.NumberInput label="Preview start time" required min={0} />}</Form.AppField>
					<Form.AppField name="previewDuration">{(ctx) => <ctx.NumberInput label="Preview duration" required min={0} />}</Form.AppField>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="environment">{(ctx) => <ctx.Combobox label="Base Environment" required creatable collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
				</Form.Row>
				<Form.Submit>Update song details</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default UpdateSongForm;
