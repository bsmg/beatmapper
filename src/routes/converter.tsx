import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { saveAs } from "file-saver";
import { Fragment, useState } from "react";

import { ExportMapForm, ImportMapForm } from "$/components/app/forms";
import { Page } from "$/components/app/layouts";
import { useAudioContext, useToaster } from "$/components/context";
import { Heading } from "$/components/ui/compositions";
import { type ExportMapArchiveOptions, exportMapArchive, importMapArchive, type MapArchiveContents } from "$/services/packaging.service";
import { Stack } from "$:styled-system/jsx";

export const Route = createFileRoute("/convert")({
	component: RouteComponent,
	head: () => {
		return { meta: [{ title: "Beatmapper Converter" }] };
	},
});

function RouteComponent() {
	const toaster = useToaster();
	const audioContext = useAudioContext();

	const [allContents, setContents] = useState<MapArchiveContents[]>([]);

	const importMutation = useMutation({
		mutationFn: async (files: File[]) => {
			setContents([]);
			for (const file of files) {
				const archive = await file.arrayBuffer();
				const content = await importMapArchive(new Uint8Array(archive), audioContext, {});
				setContents((contents) => contents.concat(content));
			}
		},
		onError: (error) => {
			toaster.error({ description: `Could not import map: ${error instanceof Error ? error.message : "See console for more info."}` });
			return console.error(error);
		},
	});

	const exportMutation = useMutation({
		mutationFn: async (payload: ExportMapArchiveOptions) => {
			if (allContents.length === 0) {
				throw new Error("No files provided.");
			}
			for (const contents of allContents) {
				saveAs(await exportMapArchive(contents, payload));
			}
		},
		onError: (error) => {
			toaster.error({ description: `Could not export map: ${error instanceof Error ? error.message : "See console for more info."}` });
			return console.error(error);
		},
	});

	return (
		<Fragment>
			<Page.Header />
			<Page.Content>
				<Stack gap={4}>
					<Heading rank={1}>Map Converter</Heading>
					<ImportMapForm onAccept={importMutation.mutate} />
					<ExportMapForm onSubmit={exportMutation.mutate} disabled={allContents.length === 0} />
				</Stack>
			</Page.Content>
			<Page.Footer />
		</Fragment>
	);
}
