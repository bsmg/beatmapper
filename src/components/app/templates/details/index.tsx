import { useDialog } from "@ark-ui/react/dialog";
import { Link, useBlocker } from "@tanstack/react-router";
import { EnvironmentNameSchema, EnvironmentV3NameSchema } from "bsmap";
import { useCallback, useState } from "react";
import { gtValue, minLength, number, object, pipe, string, transform, union } from "valibot";

import { APP_TOASTER, COVER_ART_FILE_ACCEPT_TYPE, ENVIRONMENT_COLLECTION, SONG_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useMount } from "$/components/hooks";
import { filestore } from "$/setup";
import { stopPlayback, updateModuleEnabled, updateSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectEditorOffset, selectModuleEnabled, selectSongById } from "$/store/selectors";
import type { SongId } from "$/types";

import { Stack, Wrap, styled } from "$:styled-system/jsx";
import { LocalFileUpload } from "$/components/app/compositions";
import { UpdateBeatmapForm } from "$/components/app/forms";
import { AlertDialogProvider, Field, Heading, Text, useAppForm } from "$/components/ui/compositions";
import { BeatmapFilestore } from "$/services/file.service";
import CustomColorSettings from "./custom-colors";
import SongDetailsModule from "./module";

interface Props {
	sid: SongId;
}
function SongDetails({ sid }: Props) {
	const dispatch = useAppDispatch();
	const song = useAppSelector((state) => selectSongById(state, sid));
	const enabledCustomColors = useAppSelector((state) => selectModuleEnabled(state, sid, "customColors"));
	const enabledMappingExtensions = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	const [songFile, setSongFile] = useState<File | null>(null);
	const [coverArtFile, setCoverArtFile] = useState<File | null>(null);

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
			onChange: object({
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
				environment: union([EnvironmentNameSchema, EnvironmentV3NameSchema]),
			}),
		},
		onSubmit: async ({ value, formApi }) => {
			const newSongObject = { ...song, ...value };

			if (coverArtFile) {
				const { filename: coverArtFilename } = await filestore.saveCoverArtFile(sid, coverArtFile);
				newSongObject.coverArtFilename = coverArtFilename;
			}

			if (songFile) {
				const { filename: songFilename } = await filestore.saveSongFile(sid, songFile);
				newSongObject.songFilename = songFilename;
			}

			// Update our redux state
			dispatch(updateSong({ songId: sid, changes: newSongObject }));

			formApi.reset(value);

			return APP_TOASTER.create({
				type: "success",
				description: "Successfully updated!",
			});
		},
	});

	const beatmapIds = useAppSelector((state) => selectBeatmapIds(state, sid));
	const offset = useAppSelector((state) => selectEditorOffset(state, sid));

	useMount(() => {
		// We want to stop & reset the song when the user goes to edit it.
		// In addition to seeming like a reasonable idea, it helps prevent any weirdness around editing the audio file when it's in a non-zero position.
		dispatch(stopPlayback({ offset: offset }));
	});

	const handleAcceptSongFile = useCallback(
		(file: File) => {
			setSongFile(file);
			filestore.saveSongFile(sid, file).then(() => {
				APP_TOASTER.create({
					id: "song-file-accepted",
					type: "success",
					description: "Successfully updated song file!",
				});
			});
		},
		[sid],
	);

	const handleAcceptCoverArtFile = useCallback(
		(file: File) => {
			setCoverArtFile(file);
			filestore.saveCoverArtFile(sid, file).then(() => {
				APP_TOASTER.create({
					id: "cover-file-accepted",
					type: "success",
					description: "Successfully updated cover art file!",
				});
			});
		},
		[sid],
	);

	const { proceed, reset, status } = useBlocker({
		shouldBlockFn: () => Form.state.isDirty,
		withResolver: true,
	});

	const isDirtyAlert = useDialog({ role: "alertdialog", open: status === "blocked" });

	return (
		<Stack gap={8}>
			<Stack gap={6}>
				<Heading rank={1}>Song Details</Heading>
				<Form.AppForm>
					{status === "blocked" && <AlertDialogProvider value={isDirtyAlert} render={() => <Text>You have unsaved changes! Are you sure you want to leave this page?</Text>} onSubmit={proceed} onCancel={reset} />}
					<Form.Root>
						<Form.Row>
							<Field label="Song File">
								<LocalFileUpload filename={BeatmapFilestore.resolveFilename(sid, "song", {})} deletable={false} accept={SONG_FILE_ACCEPT_TYPE} maxFiles={1} onFileAccept={(details) => handleAcceptSongFile(details.files[0])}>
									Audio File
								</LocalFileUpload>
							</Field>
							<Field label="Cover Art File">
								<LocalFileUpload filename={BeatmapFilestore.resolveFilename(sid, "cover", {})} deletable={false} accept={COVER_ART_FILE_ACCEPT_TYPE} maxFiles={1} onFileAccept={(details) => handleAcceptCoverArtFile(details.files[0])}>
									Image File
								</LocalFileUpload>
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
							<Form.AppField name="environment">{(ctx) => <ctx.Select label="Environment" collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
						</Form.Row>
						<Form.Submit>Update song details</Form.Submit>
					</Form.Root>
				</Form.AppForm>
			</Stack>
			<Stack gap={6}>
				<Heading rank={1}>Beatmaps</Heading>
				<Wrap gap={2} justify={"center"}>
					{beatmapIds.map((beatmapId) => {
						return (
							<BeatmapWrapper key={beatmapId}>
								<UpdateBeatmapForm sid={sid} bid={beatmapId} />
							</BeatmapWrapper>
						);
					})}
				</Wrap>
			</Stack>
			<Stack gap={6}>
				<Heading rank={1}>Advanced Settings</Heading>
				<Stack gap={3}>
					<SongDetailsModule label="Custom Colors" render={() => <CustomColorSettings sid={sid} />} checked={enabledCustomColors} onCheckedChange={() => dispatch(updateModuleEnabled({ songId: sid, key: "customColors" }))}>
						Override individual elements of a beatmap's color scheme.{" "}
						<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
							<Link to="/docs/$" params={{ _splat: "mods#custom-color-overrides" }}>
								Learn more
							</Link>
						</Text>
						.
					</SongDetailsModule>
					<SongDetailsModule label="Mapping Extensions" render={() => null} checked={enabledMappingExtensions} onCheckedChange={() => dispatch(updateModuleEnabled({ songId: sid, key: "mappingExtensions" }))}>
						Allows you to customize size and shape of the grid, to place notes outside of the typical 4×3 grid.{" "}
						<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
							<Link to="/docs/$" params={{ _splat: "mods#mapping-extensions" }}>
								Learn more
							</Link>
						</Text>
						.
					</SongDetailsModule>
				</Stack>
			</Stack>
		</Stack>
	);
}

const BeatmapWrapper = styled("div", {
	base: {
		colorPalette: "slate",
		layerStyle: "fill.surface",
		padding: 3,
		width: "250px",
		height: "fit-content",
	},
});

export default SongDetails;
