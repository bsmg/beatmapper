import { createListCollection } from "@ark-ui/react/collection";
import { useParams } from "@tanstack/react-router";
import { ArrowUpFromDotIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Select, Tooltip } from "$/components/ui/compositions";
import { loadGridPreset, removeGridPreset } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridPresets } from "$/store/selectors";
import { isObjectEmpty } from "$/utils";

function GridPresetsActionPanelGroup() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const gridPresets = useAppSelector(selectGridPresets);

	const [slot, setSlot] = useState<string>("");

	if (isObjectEmpty(gridPresets)) return null;

	return (
		<ActionPanelGroup.Root label="Grid Presets">
			<ActionPanelGroup.ActionGroup>
				<Select unfocusOnPress collection={createListCollection({ items: Object.keys(gridPresets) })} value={[slot]} onValueChange={(x) => setSlot(x.value[0])} />
			</ActionPanelGroup.ActionGroup>
			<ActionPanelGroup.ActionGroup>
				<Tooltip render={() => "Load Grid Preset"}>
					<Button variant="subtle" size="sm" disabled={!gridPresets[slot]} unfocusOnPress onClick={() => dispatch(loadGridPreset({ songId: sid, grid: gridPresets[slot] }))}>
						<ArrowUpFromDotIcon size={16} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Delete Grid Preset"}>
					<Button variant="subtle" size="sm" disabled={!gridPresets[slot]} unfocusOnPress onClick={() => dispatch(removeGridPreset({ songId: sid, presetSlot: slot }))}>
						<TrashIcon size={16} />
					</Button>
				</Tooltip>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default GridPresetsActionPanelGroup;
