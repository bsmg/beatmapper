import { Presence } from "@ark-ui/react/presence";
import { useMemo } from "react";
import { boolean, null_, object, picklist, union } from "valibot";

import { VERSION_COLLECTION } from "$/components/app/constants";
import { useMount } from "$/components/hooks";
import { Heading, Text, useAppForm } from "$/components/ui/compositions";
import { Panel } from "$/components/ui/styled";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { downloadMapFiles, pausePlayback } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo, selectPlaying } from "$/store/selectors";
import type { SongId } from "$/types";
import { Stack, styled, VStack } from "$:styled-system/jsx";
import { vstack } from "$:styled-system/patterns";

const SCHEMA = object({
	version: union([picklist(["1", "2", "3", "4"]), null_()]),
	minify: boolean(),
	purgeZeros: boolean(),
});

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
			version: null as "1" | "2" | "3" | "4" | null,
			minify: false,
			purgeZeros: false,
		},
		validators: {
			onMount: SCHEMA,
			onChange: SCHEMA,
		},
		onSubmit: ({ value }) => {
			dispatch(
				downloadMapFiles({
					songId: sid,
					version: value.version ? (Number.parseInt(value.version) as ImplicitVersion) : undefined,
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
					<Text>Unfortunately, the demo map is not available for download.</Text>
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
						<Stack>
							<Heading rank={2}>Options</Heading>
						</Stack>
						<Form.Row>
							<Form.AppField name="version">
								{(ctx) => (
									<Stack>
										<ctx.RadioGroup label="Serial Version" helperText={"The [serial format](https://bsmg.wiki/mapping/map-format#schemas) to export your map contents to. Generally, higher versions will offer better compatibility."} collection={VERSION_COLLECTION} />
										<Text color={"yellow.500!"} fontSize={"0.875em"}>
											{ctx.state.value !== null ? null : "NOTE: If the version is left unset, the implicit version of your map will be used (derived from when the map was originally created/imported in the editor)."}
										</Text>
									</Stack>
								)}
							</Form.AppField>
						</Form.Row>
						<Form.Row>
							<Form.AppField name="minify">{(ctx) => <ctx.Switch label="Minify JSON Data" helperText="Removes whitespace from all exported JSON files." />}</Form.AppField>
							<Form.AppField name="purgeZeros">{(ctx) => <ctx.Switch label="Prune Default Values" helperText="Removes any properties that can be polyfilled with [defaulted values](https://bsmg.wiki/mapping/map-format#defaulted-properties). Useful for optimizing maps with larger filesizes." />}</Form.AppField>
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
