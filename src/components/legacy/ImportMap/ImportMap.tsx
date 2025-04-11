import type { UseDialogContext } from "@ark-ui/react/dialog";

import { processImportedMap } from "$/services/packaging.service";
import { cancelImportingSong, importExistingSong, startImportingSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSongs } from "$/store/selectors";

import { FileUpload } from "$/components/ui/compositions";

interface Props {
	dialog?: UseDialogContext;
	onImport?: () => void;
	onCancel?: () => void;
}

const ImportMap = ({ dialog, onImport, onCancel }: Props) => {
	const songs = useAppSelector(selectAllSongs);
	const dispatch = useAppDispatch();
	const songIds = songs.map((song) => song.id);

	const handleSelectExistingMap = async (file: File) => {
		dispatch(startImportingSong());

		try {
			const songData = await processImportedMap(file, songIds);

			dispatch(importExistingSong({ songData }));
			onImport?.();
			if (dialog) dialog.setOpen(false);
		} catch (err) {
			console.error("Could not import map:", err);
			dispatch(cancelImportingSong());
			onCancel?.();
		}
	};

	return <FileUpload onFileAccept={(details) => handleSelectExistingMap(details.files[0])}>Map Archive File</FileUpload>;
};

export default ImportMap;
