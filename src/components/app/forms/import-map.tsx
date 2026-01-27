import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useCallback } from "react";
import { Fragment } from "react/jsx-runtime";

import { MapArchiveFileUpload } from "$/components/app/compositions";
import { List } from "$/components/ui/compositions";
import { useAppSelector } from "$/store/hooks";
import { selectProcessingImport } from "$/store/selectors";
import { Stack, Text } from "$:styled-system/jsx";

interface Props {
	dialog?: UseDialogContext;
}
function ImportMapForm({ dialog }: Props) {
	const isProcessingImport = useAppSelector(selectProcessingImport);

	const handleFileAccept = useCallback(() => {
		if (dialog) dialog.setOpen(false);
	}, [dialog]);

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
				<MapArchiveFileUpload disabled={isProcessingImport} onFileAccept={handleFileAccept} />
			</Stack>
		</Fragment>
	);
}

export default ImportMapForm;
