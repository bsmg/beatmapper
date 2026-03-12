import type { Assign } from "@ark-ui/react";
import { useListCollection } from "@ark-ui/react/collection";
import type { BeatmapFileType, InferBeatmapVersion } from "bsmap/types";
import type { ComponentProps } from "react";
import { boolean, null_, object, picklist, union } from "valibot";

import { useSetupContext } from "$/components/context";
import { Heading, useAppForm } from "$/components/ui/compositions";
import type { SubmitButton } from "$/components/ui/compositions/button";
import type { ExportMapArchiveOptions } from "$/services/packaging.service";
import { Stack, styled, Text, VStack } from "$:styled-system/jsx";

const SCHEMA = object({
	version: union([picklist(["1", "2", "3", "4"]), null_()]),
	minify: boolean(),
	purgeZeros: boolean(),
});

interface Props {
	onSubmit: (ctx: ExportMapArchiveOptions) => void;
}
function ExportMapForm({ onSubmit, ...rest }: Assign<ComponentProps<typeof SubmitButton>, Props>) {
	const { toaster } = useSetupContext();

	const { collection: serialVersionCollection } = useListCollection({
		initialItems: ["4", "3", "2", "1"],
		itemToString: (item) => `v${item}`,
		isItemDisabled: (item) => item === "1",
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
			onSubmit: SCHEMA,
		},
		onSubmit: ({ value }) => {
			try {
				return onSubmit({
					version: value.version ? (Number.parseInt(value.version, 10) as InferBeatmapVersion<BeatmapFileType>) : null,
					saveOptions: { format: value.minify ? 0 : 2, optimize: { purgeZeros: value.purgeZeros } },
				});
			} catch (error) {
				toaster?.error({ description: `Could not export map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	return (
		<Form.AppForm>
			<Form.Root>
				<Panel gap={6}>
					<VStack gap={2}>
						<Text textStyle={"paragraph"}>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Text>
						<Form.Submit variant="solid" size="md" {...rest}>
							Download map files
						</Form.Submit>
					</VStack>
				</Panel>
				<Stack>
					<Heading rank={2}>Options</Heading>
				</Stack>
				<Form.Row>
					<Form.AppField name="version">
						{(ctx) => (
							<Stack>
								<ctx.RadioGroup collection={serialVersionCollection} label="Serial Version" helperText={"The [serial format](https://bsmg.wiki/mapping/map-format#schemas) to export your map contents to. Generally, higher versions will offer better compatibility."} />
								<Text textStyle={"paragraph"} color={"fg.muted"} fontSize={"0.875em"}>
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
		</Form.AppForm>
	);
}

const Panel = styled(VStack, {
	base: {
		layerStyle: "fill.surface",
		colorPalette: "slate",
		padding: 4,
		textAlign: "center",
	},
});

export default ExportMapForm;
