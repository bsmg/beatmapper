import type { BeatmapFileType, ISaveOptions } from "bsmap/types";
import { boolean, null_, object, picklist, union } from "valibot";

import { VERSION_COLLECTION } from "$/components/app/constants";
import { Heading, useAppForm } from "$/components/ui/compositions";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { Stack, styled, Text, VStack } from "$:styled-system/jsx";

const SCHEMA = object({
	version: union([picklist(["1", "2", "3", "4"]), null_()]),
	minify: boolean(),
	purgeZeros: boolean(),
});

interface Props {
	onSubmit: (ctx: { version: ImplicitVersion | undefined; options: ISaveOptions<BeatmapFileType, ImplicitVersion> }) => void;
}
function ExportMapForm({ onSubmit }: Props) {
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
			return onSubmit({
				version: value.version ? (Number.parseInt(value.version, 10) as ImplicitVersion) : undefined,
				options: { format: value.minify ? 0 : 2, optimize: { purgeZeros: value.purgeZeros } },
			});
		},
	});

	return (
		<Form.AppForm>
			<Form.Root>
				<Panel gap={6}>
					<VStack gap={2}>
						<Text textStyle={"paragraph"}>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Text>
						<Form.Submit variant="solid" size="md">
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
								<ctx.RadioGroup label="Serial Version" helperText={"The [serial format](https://bsmg.wiki/mapping/map-format#schemas) to export your map contents to. Generally, higher versions will offer better compatibility."} collection={VERSION_COLLECTION} />
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
