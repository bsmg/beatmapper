import { createListCollection } from "@ark-ui/react/collection";
import type { MenuSelectionDetails } from "@ark-ui/react/menu";
import { ChevronDownIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { isSongReadonly } from "$/helpers/song.helpers";
import { deleteSong, downloadMapFiles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectSongById } from "$/store/selectors";
import type { App, SongId } from "$/types";

import { Button, Menu } from "$/components/ui/compositions";

interface SongActionListCollection {
	song: App.Song;
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

	const handleActionSelect = useCallback(
		(details: MenuSelectionDetails) => {
			switch (details.value) {
				case "delete": {
					if (!window.confirm("Are you sure? This action cannot be undone 😱")) return;
					return dispatch(deleteSong({ songId: sid, beatmapIds: beatmapIds }));
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
		[dispatch, sid, beatmapIds],
	);

	return (
		<Menu collection={ACTION_LIST_COLLECTION} onSelect={handleActionSelect}>
			<Button variant="subtle" size="icon">
				<ChevronDownIcon size={16} />
			</Button>
		</Menu>
	);
}

export default SongsDataTableActions;
