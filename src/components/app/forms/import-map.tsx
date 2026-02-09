import type { UseDialogContext } from "@ark-ui/react/dialog";
import type { FileUploadFileAcceptDetails } from "@ark-ui/react/file-upload";
import { Fragment } from "react/jsx-runtime";

import { APP_TOASTER, MAP_ARCHIVE_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { FileUpload, List } from "$/components/ui/compositions";
import { addSongFromFile } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectProcessingImport, selectSongIds } from "$/store/selectors";
import { Stack, Text } from "$:styled-system/jsx";

interface Props {
	dialog?: UseDialogContext;
}
function ImportMapForm({ dialog }: Props) {
	const dispatch = useAppDispatch();
	const songIds = useAppSelector(selectSongIds);
	const isProcessingImport = useAppSelector(selectProcessingImport);

	const handleFileAccept = async (details: FileUploadFileAcceptDetails) => {
		for (const file of details.files) {
			try {
				await dispatch(addSongFromFile({ file, options: { currentSongIds: songIds } }));
			} catch (err) {
				console.error("Could not import map:", err);
				return APP_TOASTER.create({
					id: "import-map-fail",
					type: "error",
					description: "Could not import map. See console for more info.",
				});
			}
		}
		if (dialog) dialog.setOpen(false);
	};

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
				<FileUpload label="Map Archive File" disabled={isProcessingImport} accept={MAP_ARCHIVE_FILE_ACCEPT_TYPE} onFileAccept={handleFileAccept} />
			</Stack>
		</Fragment>
	);
}

export default ImportMapForm;
