import { useListCollection } from "@ark-ui/react/collection";
import type { MenuSelectionDetails } from "@ark-ui/react/menu";
import { toPascalCase } from "@std/text/to-pascal-case";
import { useCallback } from "react";

import { useToaster } from "$/components/context";
import { Button, Menu, usePrompt } from "$/components/ui/compositions";
import { downloadMapFiles, removeSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectDemo } from "$/store/selectors";
import type { SongId } from "$/types";
import { Text } from "$:styled-system/jsx";

interface Props {
	sid: SongId;
}
function SongsDataTableActions({ sid }: Props) {
	const toaster = useToaster();

	const dispatch = useAppDispatch();
	const isDemo = useAppSelector((state) => selectDemo(state, sid));
	const beatmapIds = useAppSelector((state) => selectBeatmapIds(state, sid));

	const { collection: ACTION_LIST_COLLECTION } = useListCollection({
		initialItems: ["download", "delete"],
		itemToString: toPascalCase,
		isItemDisabled: (item) => import.meta.env.PROD && isDemo && !["delete"].includes(item),
	});

	const { trigger: triggerDelete } = usePrompt({
		render: () => <Text textStyle="paragraph">Are you sure you want to do this? This action cannot be undone.</Text>,
		onSubmit: () => dispatch(removeSong({ songId: sid, beatmapIds: beatmapIds })),
	});

	const handleActionSelect = useCallback(
		(details: MenuSelectionDetails) => {
			switch (details.value) {
				case "delete": {
					return triggerDelete();
				}
				case "download": {
					return dispatch(downloadMapFiles({ songId: sid, options: { version: null } }));
				}
				default: {
					return toaster.create({
						id: `song-action.${details.value}`,
						description: "This feature does not exist yet. Sorry! Coming soon.",
					});
				}
			}
		},
		[dispatch, toaster, sid, triggerDelete],
	);

	return (
		<Menu collection={ACTION_LIST_COLLECTION} onSelect={handleActionSelect}>
			{(Indicator) => (
				<Button variant="subtle" size="icon">
					<Indicator size={16} />
				</Button>
			)}
		</Menu>
	);
}

export default SongsDataTableActions;
