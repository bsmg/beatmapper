import type { FileUploadFileAcceptDetails } from "@ark-ui/react/file-upload";
import type { ComponentProps } from "react";

import { APP_TOASTER, MAP_ARCHIVE_FILE_ACCEPT_TYPE } from "$/components/app/constants";
import { useLocalFileQuery } from "$/components/app/hooks";
import { FileUpload } from "$/components/ui/compositions";
import { addSongFromFile } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds } from "$/store/selectors";

export function LocalFileUpload({ filename, children, ...rest }: ComponentProps<typeof FileUpload> & { filename: string }) {
	const { data: currentFile, isSuccess } = useLocalFileQuery(filename, {
		queryKeySuffix: "picker",
		transform: (file) => (file ? [file] : []),
	});

	return (
		<FileUpload {...rest} key={`${filename}.${isSuccess}`} files={currentFile}>
			{children}
		</FileUpload>
	);
}

export function MapArchiveFileUpload({ onFileAccept, ...rest }: ComponentProps<typeof FileUpload>) {
	const dispatch = useAppDispatch();
	const songIds = useAppSelector(selectSongIds);

	const handleFileAccept = async (details: FileUploadFileAcceptDetails) => {
		for (const file of details.files) {
			try {
				await dispatch(addSongFromFile({ file, options: { currentSongIds: songIds } }));
			} catch (err) {
				console.error("Could not import map:", err);
				if (onFileAccept) onFileAccept({ files: [] });
				return APP_TOASTER.create({
					id: "import-map-fail",
					type: "error",
					description: "Could not import map. See console for more info.",
				});
			}
		}
		if (onFileAccept) onFileAccept(details);
	};

	return (
		<FileUpload {...rest} accept={MAP_ARCHIVE_FILE_ACCEPT_TYPE} onFileAccept={handleFileAccept}>
			Map Archive File
		</FileUpload>
	);
}

export default MapArchiveFileUpload;
