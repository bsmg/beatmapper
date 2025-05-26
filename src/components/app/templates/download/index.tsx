import { Presence } from "@ark-ui/react/presence";
import { useMemo } from "react";
import { boolean, object, picklist } from "valibot";

import { VERSION_COLLECTION } from "$/components/app/constants";
import { useMount } from "$/components/hooks";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { downloadMapFiles, pausePlayback } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo, selectPlaying } from "$/store/selectors";
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
	const isDemo = useAppSelector((state) => selectDemo(state, sid));
	const isPlaying = useAppSelector(selectPlaying);

	// When this component mounts, if the song is playing, pause it.
	useMount(() => {
		if (isPlaying) {
			dispatch(pausePlayback({ songId: sid }));
		}
	});

	const Form = useAppForm({
		defaultValues: {
			version: "",
			minify: false,
			purgeZeros: false,
		},
		validators: {
			onChange: object({
				version: picklist(["1", "2", "3", "4"]),
				minify: boolean(),
				purgeZeros: boolean(),
			}),
		},
		onSubmit: ({ value }) => {
			dispatch(
				downloadMapFiles({
					songId: sid,
					version: Number.parseInt(value.version) as ImplicitVersion,
					options: {
						format: value.minify ? 0 : 2,
						optimize: {
							purgeZeros: value.purgeZeros,
						},
					},
				}),
			);
		},
	});

	const demoBlocker = useMemo(() => import.meta.env.PROD && isDemo, [isDemo]);

	return (
		<Form.AppForm>
			<Stack gap={4}>
				<Heading rank={1}>Download Map</Heading>
				<Presence asChild present={demoBlocker} lazyMount unmountOnExit>
					<VStack gap={6}>
						<Text>Unfortunately, the demo map is not available for download.</Text>
					</VStack>
				</Presence>
				<Presence asChild present={!demoBlocker} lazyMount unmountOnExit>
					<Form.Root>
						<Content>
							<VStack gap={6}>
								<VStack gap={2}>
									<Text>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Text>
									<Form.Submit variant="solid" size="md">
										Download map files
									</Form.Submit>
								</VStack>
							</VStack>
						</Content>
						<Heading rank={2}>Options</Heading>
						<Form.Row>
							<Form.AppField name="version">{(ctx) => <ctx.RadioGroup label="Serial Version" required collection={VERSION_COLLECTION} />}</Form.AppField>
						</Form.Row>
						<Form.Row>
							<Form.AppField name="minify">{(ctx) => <ctx.Switch label="Minify JSON Data" />}</Form.AppField>
							<Form.AppField name="purgeZeros">{(ctx) => <ctx.Switch label="Prune Default Values" />}</Form.AppField>
						</Form.Row>
					</Form.Root>
				</Presence>
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
