import { useDialog } from "@ark-ui/react/dialog";
import { useBlocker, useParams } from "@tanstack/react-router";
import type { EnvironmentName, EnvironmentV3Name } from "bsmap/types";
import { custom, gtValue, minLength, number, object, pipe, string, transform } from "valibot";

import { APP_TOASTER, COVER_ART_FILE_ACCEPT_TYPE, ENVIRONMENT_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useLocalFileMutation, useLocalFileQuery } from "$/components/app/hooks/local-file.hooks";
import { AlertDialogProvider, Field, FileUpload, useAppForm } from "$/components/ui/compositions";
import { BeatmapFilestore } from "$/services/file.service";
import { filestore } from "$/setup";
import { updateSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import { Text } from "$:styled-system/jsx";

const SCHEMA = object({
	name: pipe(string(), minLength(1)),
	subName: pipe(string()),
	artistName: pipe(string(), minLength(1)),
	bpm: pipe(number(), gtValue(0)),
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
	previewStartTime: pipe(number()),
	previewDuration: pipe(number()),
	environment: custom<EnvironmentName | EnvironmentV3Name>((name) => typeof name === "string" && name.endsWith("Environment"), 'Invalid environment name: Must end with "Environment" as the suffix.'),
});

function UpdateSongForm() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const song = useAppSelector((state) => selectSongById(state, sid));

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
			APP_TOASTER.success({ id: "song-file-accepted", description: "Successfully updated song file!" });
		},
	});
	const { mutate: handleAcceptCoverArtFile } = useLocalFileMutation(BeatmapFilestore.resolveFilename(sid, "cover", {}), {
		onSuccess: () => {
			APP_TOASTER.success({ id: "cover-art-file-accepted", description: "Successfully updated cover art file!" });
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
				dispatch(updateSong({ songId: sid, changes: newSongObject }));

				formApi.reset(value);
			} catch (error) {
				APP_TOASTER.error({ description: error instanceof Error ? error.message : `Error updating song: See console for more information.` });
				console.error(error);
			}
		},
	});

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
					<Field label="Song File">
						<FileUpload label="Audio File" deletable={false} accept={SONG_FILE_ACCEPT_TYPE} maxFiles={1} acceptedFiles={acceptedSongFile} onFileAccept={(details) => handleAcceptSongFile(details.files[0])} />
					</Field>
					<Field label="Cover Art File">
						<FileUpload label="Image File" deletable={false} accept={COVER_ART_FILE_ACCEPT_TYPE} maxFiles={1} acceptedFiles={acceptedCoverArtFile} onFileAccept={(details) => handleAcceptCoverArtFile(details.files[0])} />
					</Field>
				</Form.Row>
				<Form.Row>
					{/* @ts-ignore */}
					<Form.AppField name="name">{(ctx) => <ctx.Input label="Song name" required />}</Form.AppField>
					<Form.AppField name="subName">{(ctx) => <ctx.Input label="Song sub-name" />}</Form.AppField>
					<Form.AppField name="artistName">{(ctx) => <ctx.Input label="Artist name" required />}</Form.AppField>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="bpm">{(ctx) => <ctx.NumberInput label="BPM (Beats per Minute)" required />}</Form.AppField>
					<Form.AppField name="offset">{(ctx) => <ctx.NumberInput label="Editor Offset" placeholder="0" />}</Form.AppField>
					<Form.AppField name="previewStartTime">{(ctx) => <ctx.NumberInput label="Preview start time" required placeholder="(in seconds)" />}</Form.AppField>
					<Form.AppField name="previewDuration">{(ctx) => <ctx.NumberInput label="Preview duration" required placeholder="(in seconds)" />}</Form.AppField>
				</Form.Row>
				<Form.Row>
					<Form.AppField name="environment">{(ctx) => <ctx.Combobox label="Environment" helperText={"If a newer environment is not available to select, simply create a new entry in the combobox."} creatable collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
				</Form.Row>
				<Form.Submit>Update song details</Form.Submit>
			</Form.Root>
		</Form.AppForm>
	);
}

export default UpdateSongForm;
