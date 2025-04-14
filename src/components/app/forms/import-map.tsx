import type { UseDialogContext } from "@ark-ui/react/dialog";
import { useCallback } from "react";
import { Fragment } from "react/jsx-runtime";

import { Stack } from "$:styled-system/jsx";
import MapArchiveFileUpload from "$/components/app/compositions/file-upload";
import { List, Text } from "$/components/ui/compositions";

interface Props {
	dialog?: UseDialogContext;
}
function ImportMapForm({ dialog }: Props) {
	const handleFileAccept = useCallback(() => {
		if (dialog) dialog.setOpen(false);
	}, [dialog]);

	return (
		<Fragment>
			<Stack gap={0}>
				<Text textStyle={"paragraph"} fontSize={18} fontWeight={400}>
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
				<Text color={"fg.muted"} fontSize={"18px"} fontWeight={300}>
					Drag and drop (or click to select) the .zip file:
				</Text>
				<MapArchiveFileUpload onFileAccept={handleFileAccept} />
			</Stack>
		</Fragment>
	);
}

export default ImportMapForm;
