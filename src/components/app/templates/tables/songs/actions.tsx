import { createListCollection, useDialog } from "@ark-ui/react";
import type { MenuSelectionDetails } from "@ark-ui/react/menu";
import { ChevronDownIcon } from "lucide-react";
import { Fragment, useCallback, useMemo } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { isSongReadonly } from "$/helpers/song.helpers";
import { downloadMapFiles, removeSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectSongById } from "$/store/selectors";
import type { App, SongId } from "$/types";

import { AlertDialogProvider, Button, Menu, Text } from "$/components/ui/compositions";

interface SongActionListCollection {
	song: App.ISong;
}
function createSongActionListCollection({ song }: SongActionListCollection) {
	return createListCollection({
		items: ["copy", "delete", "download"].map((value, index) => {
			return { value, label: ["Copy", "Delete", "Download"][index] };
		}),
		isItemDisabled: (item) => import.meta.env.PROD && isSongReadonly(song) && !["delete"].includes(item.value),
	});
}

interface Props {
	sid: SongId;
}
function SongsDataTableActions({ sid }: Props) {
	const song = useAppSelector((state) => selectSongById(state, sid));
	const beatmapIds = useAppSelector((state) => selectBeatmapIds(state, sid));
	const dispatch = useAppDispatch();

	const ACTION_LIST_COLLECTION = useMemo(() => createSongActionListCollection({ song }), [song]);

	const deleteAlert = useDialog({ role: "alertdialog" });

	const handleDeleteAction = useCallback(() => {
		return dispatch(removeSong({ id: sid, beatmapIds: beatmapIds }));
	}, [dispatch, sid, beatmapIds]);

	const handleActionSelect = useCallback(
		(details: MenuSelectionDetails) => {
			switch (details.value) {
				case "delete": {
					return deleteAlert.setOpen(true);
				}
				case "download": {
					return dispatch(downloadMapFiles({ songId: sid }));
				}
				default: {
					return APP_TOASTER.create({
						id: `song-action.${details.value}`,
						description: "This feature does not exist yet. Sorry! Coming soon.",
					});
				}
			}
		},
		[dispatch, sid, deleteAlert],
	);

	return (
		<Fragment>
			<Menu collection={ACTION_LIST_COLLECTION} onSelect={handleActionSelect}>
				<Button variant="subtle" size="icon">
					<ChevronDownIcon size={16} />
				</Button>
			</Menu>
			<AlertDialogProvider value={deleteAlert} render={() => <Text>Are you sure? This action cannot be undone 😱</Text>} onSubmit={handleDeleteAction} />
		</Fragment>
	);
}

export default SongsDataTableActions;
