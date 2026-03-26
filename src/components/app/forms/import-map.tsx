import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import type { FileUploadFileChangeDetails } from "@ark-ui/react/file-upload";
import { type ComponentProps, useCallback } from "react";
import { Fragment } from "react/jsx-runtime";

import { MAP_ARCHIVE_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useSetupContext } from "$/components/context";
import { FileUpload, List } from "$/components/ui/compositions";
import { Stack, Text } from "$:styled-system/jsx";

interface Props {
	dialog?: UseDialogContext;
	onAccept: (files: File[]) => void;
}
function ImportMapForm({ dialog, onAccept, ...rest }: Assign<ComponentProps<typeof FileUpload>, Props>) {
	const { toaster } = useSetupContext();

	const handleFileChange = useCallback(
		(details: FileUploadFileChangeDetails) => {
			if (dialog) dialog.setOpen(false);

			try {
				onAccept(details.acceptedFiles);
			} catch (error) {
				toaster?.error({ description: `Could not import map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
		[dialog, toaster, onAccept],
	);

	return (
		<Fragment>
			<Stack gap={0}>
				<Text textStyle={"paragraph"} color={"fg.default"} fontSize={"18px"} fontWeight={400}>
					To import a map, the following conditions must be met:
				</Text>
				<List.Root type="unordered" variant="plain">
					<List.Item>You have a song in OGG format (.ogg or .egg)</List.Item>
					<List.Item>You have a cover-art image in JPEG format</List.Item>
					<List.Item>You have the info file (either .json or .dat), and all relevant difficulty files</List.Item>
					<List.Item>You've zipped them all up, without an enclosing folder (select all files and archive them directly)</List.Item>
				</List.Root>
			</Stack>
			<Stack gap={2}>
				<Text textStyle={"paragraph"} color={"fg.muted"} fontSize={"18px"} fontWeight={300}>
					Drag and drop (or click to select) the .zip file:
				</Text>
				<FileUpload {...rest} label="Map Archive File" accept={MAP_ARCHIVE_FILE_ACCEPT_TYPE} onFileChange={handleFileChange} />
			</Stack>
		</Fragment>
	);
}

export default ImportMapForm;
