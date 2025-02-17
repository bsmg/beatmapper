import { download as fileIcon } from "react-icons-kit/feather/download";

import { processImportedMap } from "$/services/packaging.service";
import { cancelImportingSong, importExistingSong, startImportingSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSongs } from "$/store/selectors";

import FileUploader from "../FileUploader";

interface Props {
	onImport: () => void;
	onCancel: () => void;
	height?: number;
}

const ImportMap = ({ onImport, onCancel, height }: Props) => {
	const songs = useAppSelector(selectAllSongs);
	const dispatch = useAppDispatch();
	const songIds = songs.map((song) => song.id);

	const handleSelectExistingMap = async (file: File) => {
		dispatch(startImportingSong());

		try {
			const songData = await processImportedMap(file, songIds);

			dispatch(importExistingSong({ songData }));
			onImport();
		} catch (err) {
			console.error("Could not import map:", err);
			dispatch(cancelImportingSong());
			onCancel();
		}
	};

	return <FileUploader onSelectFile={handleSelectExistingMap} icon={fileIcon} height={height} title="Import existing map" description="Select a .zip file" />;
};

export default ImportMap;
