import { Link, useBlocker } from "@tanstack/react-router";
import { useState } from "react";
import { gtValue, minLength, number, object, pipe, string, transform } from "valibot";

import { useLocalFileQuery, useMount } from "$/hooks";
import { createInfoContent } from "$/services/packaging.service";
import { filestore } from "$/setup";
import { stopPlaying, togglePropertyForSelectedSong, updateSongDetails } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectIsFastWallsEnabled, selectIsLightshowEnabled, selectSongById } from "$/store/selectors";
import type { SongId } from "$/types";

import { Container, Stack, Wrap, styled } from "$:styled-system/jsx";
import { APP_TOASTER, ENVIRONMENT_COLLECTION } from "$/components/app/constants";
import { Checkbox, Field, FileUpload, Heading, Text, useAppForm } from "$/components/ui/compositions";
import QuestionTooltip from "../QuestionTooltip";
import BeatmapDifficultySettings from "./BeatmapDifficultySettings";
import CustomColorSettings from "./CustomColorSettings";
import MappingExtensionSettings from "./MappingExtensionSettings";

interface Props {
	songId: SongId;
}
const SongDetails = ({ songId }: Props) => {
	const song = useAppSelector((state) => selectSongById(state, songId));
	const enabledFastWalls = useAppSelector((state) => selectIsFastWallsEnabled(state, songId));
	const enabledLightshow = useAppSelector((state) => selectIsLightshowEnabled(state, songId));
	const dispatch = useAppDispatch();

	const [songFile, setSongFile] = useState<File | null>(null);
	const [coverArtFile, setCoverArtFile] = useState<File | null>(null);

	const { data: currentSongFile, isSuccess: isSongQuerySuccess } = useLocalFileQuery(song.songFilename, {
		queryKeySuffix: "picker",
		transform: (file) => (file ? [file] : []),
	});
	const { data: currentCoverArtFile, isSuccess: isCoverArtQuerySuccess } = useLocalFileQuery(song.coverArtFilename, {
		queryKeySuffix: "picker",
		transform: (file) => (file ? [file] : []),
	});

	const Form = useAppForm({
		defaultValues: {
			name: song.name ?? "",
			subName: song.subName ?? "",
			artistName: song.artistName ?? "",
			mapAuthorName: song.mapAuthorName ?? "",
			bpm: song.bpm ?? 120,
			offset: song.offset ?? 0,
			swingAmount: song.swingAmount ?? 0,
			swingPeriod: song.swingPeriod ?? 0,
			previewStartTime: song.previewStartTime ?? 12,
			previewDuration: song.previewDuration ?? 10,
			environment: song.environment ?? "DefaultEnvironment",
		},
		validators: {
			onChange: object({
				name: pipe(string(), minLength(1)),
				subName: pipe(string()),
				artistName: pipe(string(), minLength(1)),
				mapAuthorName: pipe(string(), minLength(1)),
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
				environment: pipe(string()),
			}),
		},
		onSubmit: async ({ value }) => {
			// Alert the user if they need to choose a song before saving
			// TODO: I should go back to the default cover art if they remove the art.
			if (!songFile) {
				return APP_TOASTER.create({
					id: "missing-song-file",
					type: "error",
					description: "Please select a song file before saving",
				});
			}

			const newSongObject = { ...song, ...value };

			// When the user selects a file from their local machine, we store a File object type. BUT, when the user uploads a pre-existing map, the file is actually a Blob.
			// They're similar in many ways, but they don't have a filename, and that breaks things.
			// So, we should only try and save the cover art IF it's a proper file. If it's a blob, it can't have changed anyway.
			const shouldSaveCoverArt = coverArtFile?.name;

			if (shouldSaveCoverArt) {
				const { filename: coverArtFilename } = await filestore.saveCoverFile(song.id, coverArtFile);
				newSongObject.coverArtFilename = coverArtFilename;
			}

			if (songFile) {
				const { filename: songFilename } = await filestore.saveSongFile(song.id, songFile);
				newSongObject.songFilename = songFilename;
			}

			// Update our redux state
			dispatch(updateSongDetails({ songId: song.id, songData: newSongObject }));

			// Back up our latest data!
			await filestore.saveInfoFile(song.id, createInfoContent(newSongObject, { version: 2 }));
		},
	});

	const difficultyIds = useAppSelector((state) => selectBeatmapIds(state, songId));

	useMount(() => {
		// We want to stop & reset the song when the user goes to edit it.
		// In addition to seeming like a reasonable idea, it helps prevent any weirdness around editing the audio file when it's in a non-zero position.
		dispatch(stopPlaying({ offset: song.offset }));
	});

	useBlocker({
		shouldBlockFn: () => (Form.state.isDirty ? !window.confirm("You have unsaved changes! Are you sure you want to leave this page?") : false),
	});

	return (
		<Wrapper>
			<Container>
				<Stack gap={8}>
					<Stack gap={6}>
						<Heading rank={1}>Edit Song Details</Heading>
						<Form.AppForm>
							<Form.Root>
								<Form.Row>
									<Field label="Song File">
										<FileUpload key={`songFile.${isSongQuerySuccess}`} files={currentSongFile} onFileAccept={(details) => setSongFile(details.files[0])}>
											Audio File
										</FileUpload>
									</Field>
									<Field label="Cover Art File">
										<FileUpload key={`coverArtFile.${isCoverArtQuerySuccess}`} files={currentCoverArtFile} onFileAccept={(details) => setCoverArtFile(details.files[0])}>
											Image File
										</FileUpload>
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
									<Form.AppField name="mapAuthorName">{(ctx) => <ctx.Input label="Map author name" required />}</Form.AppField>
									<Form.AppField name="environment">{(ctx) => <ctx.Select label="Environment" collection={ENVIRONMENT_COLLECTION} />}</Form.AppField>
								</Form.Row>
								<Form.Submit>Update song details</Form.Submit>
							</Form.Root>
						</Form.AppForm>
					</Stack>
					<Stack gap={6}>
						<Heading rank={1}>Edit Difficulties</Heading>
						<Wrap gap={2} justify={"center"}>
							{difficultyIds.map((difficultyId) => {
								return <BeatmapDifficultySettings key={difficultyId} songId={songId} difficultyId={difficultyId} />;
							})}
						</Wrap>
					</Stack>
					<Stack gap={6}>
						<Heading rank={1}>Advanced Settings</Heading>
						<Stack gap={3}>
							<CustomColorSettings />
							<MappingExtensionSettings />
							<Checkbox id="enable-lightshow" checked={!!enabledLightshow} onCheckedChange={() => dispatch(togglePropertyForSelectedSong({ songId, property: "enabledLightshow" }))}>
								Includes "Lightshow" difficulty{" "}
								<QuestionTooltip>
									If enabled, adds a non-standard difficulty with all blocks removed. Nice to include if your lighting is spectacular{" "}
									<span role="img" aria-label="sparkles">
										✨
									</span>
								</QuestionTooltip>
							</Checkbox>
							<Checkbox id="enable-fast-walls" checked={!!enabledFastWalls} onCheckedChange={() => dispatch(togglePropertyForSelectedSong({ songId, property: "enabledFastWalls" }))}>
								Enable "fast walls"{" "}
								<QuestionTooltip>
									Fast walls exploit a loophole in the game to allow walls to blur by at high speed{" "}
									<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
										<Link to="/docs/$" params={{ _splat: "fast-walls" }}>
											Learn more
										</Link>
									</Text>
									.
								</QuestionTooltip>
							</Checkbox>
						</Stack>
					</Stack>
				</Stack>
			</Container>
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		maxHeight: "100vh",
		overflow: "auto",
		paddingBlock: 8,
	},
});

export default SongDetails;
