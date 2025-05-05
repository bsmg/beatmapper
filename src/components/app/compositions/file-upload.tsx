import type { FileUploadFileAcceptDetails } from "@ark-ui/react/file-upload";
import type { ComponentProps } from "react";

import { processImportedMap } from "$/services/packaging.service";
import { cancelImportingSong, importExistingSong, startImportingSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSongs } from "$/store/selectors";

import { APP_TOASTER } from "$/components/app/constants";
import { useLocalFileQuery } from "$/components/app/hooks";
import { FileUpload } from "$/components/ui/compositions";

export function LocalFileUpload({ filename, onFileAccept, children, ...rest }: ComponentProps<typeof FileUpload> & { filename: string }) {
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
	const songs = useAppSelector(selectAllSongs);
	const dispatch = useAppDispatch();
	const songIds = songs.map((song) => song.id);

	const handleFileAccept = async (details: FileUploadFileAcceptDetails) => {
		dispatch(startImportingSong());
		for (const file of details.files) {
			try {
				const songData = await processImportedMap(file, { currentSongIds: songIds });
				dispatch(importExistingSong({ songData: { ...songData } }));
			} catch (err) {
				dispatch(cancelImportingSong());
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
		<FileUpload {...rest} accept={"application/x-zip-compressed"} onFileAccept={handleFileAccept}>
			Map Archive File
		</FileUpload>
	);
}

export default MapArchiveFileUpload;
