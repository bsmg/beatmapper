import { Presence } from "@ark-ui/react/presence";
import { useMemo } from "react";

import { VERSION_COLLECTION } from "$/components/app/constants";
import { useMount } from "$/components/hooks";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { downloadMapFiles, pausePlaying } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectIsDemoSong, selectIsPlaying } from "$/store/selectors";
import type { SongId } from "$/types";

import { Stack, VStack, styled } from "$:styled-system/jsx";
import { vstack } from "$:styled-system/patterns";
import { Heading, Text, useAppForm } from "$/components/ui/compositions";
import { Panel } from "$/components/ui/styled";

interface Props {
	sid: SongId;
}
function Download({ sid }: Props) {
	const dispatch = useAppDispatch();
	const isDemo = useAppSelector((state) => selectIsDemoSong(state, sid));
	const isPlaying = useAppSelector(selectIsPlaying);

	// When this component mounts, if the song is playing, pause it.
	useMount(() => {
		if (isPlaying) {
			pausePlaying();
		}
	});

	const Form = useAppForm({
		defaultValues: {
			version: "4",
		},
		onSubmit: ({ value }) => {
			dispatch(downloadMapFiles({ songId: sid, version: Number.parseInt(value.version) as ImplicitVersion }));
		},
	});

	const canDownload = useMemo(() => import.meta.env.PROD && isDemo, [isDemo]);

	return (
		<Form.AppForm>
			<Stack gap={4}>
				<Heading rank={1}>Download Map</Heading>
				<Form.Root>
					<Content>
						<Presence asChild present={canDownload} lazyMount unmountOnExit>
							<VStack gap={6}>
								<Text>Unfortunately, the demo map is not available for download.</Text>
							</VStack>
						</Presence>
						<Presence asChild present={!canDownload} lazyMount unmountOnExit>
							<VStack gap={6}>
								<VStack gap={2}>
									<Text>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Text>
									<Form.Submit variant="solid" size="md">
										Download map files
									</Form.Submit>
								</VStack>
							</VStack>
						</Presence>
					</Content>
					<Heading rank={2}>Options</Heading>
					<Form.AppField name="version">{(ctx) => <ctx.RadioGroup label="Serial Version" required collection={VERSION_COLLECTION} />}</Form.AppField>
				</Form.Root>
			</Stack>
		</Form.AppForm>
	);
}

const Content = styled(Panel, {
	base: vstack.raw({
		padding: 4,
		textAlign: "center",
	}),
});

export default Download;
