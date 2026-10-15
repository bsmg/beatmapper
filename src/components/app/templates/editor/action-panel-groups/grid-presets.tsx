import { createListCollection } from "@ark-ui/react/collection";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Select } from "$/components/ui/compositions";
import { loadGridPreset, removeGridPreset } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridPresets } from "$/store/selectors";
import { isObjectEmpty } from "$/utils";

function GridPresetsActionPanelGroup() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const gridPresets = useAppSelector(selectGridPresets);

	const [slot, setSlot] = useState<string>(Object.keys(gridPresets)[0]);

	if (isObjectEmpty(gridPresets)) return null;

	return (
		<ActionPanelGroup.Root label="Grid Presets">
			<ActionPanelGroup.Section>
				<Select unfocusOnPress collection={createListCollection({ items: Object.keys(gridPresets) })} value={[slot]} onValueChange={(x) => setSlot(x.value[0])} />
				<Button variant="subtle" size="sm" disabled={!gridPresets[slot]} unfocusOnPress onClick={() => dispatch(loadGridPreset({ slot }))}>
					Apply
				</Button>
				<Button variant="subtle" size="sm" disabled={!gridPresets[slot]} unfocusOnPress onClick={() => dispatch(removeGridPreset({ songId: sid, presetSlot: slot }))}>
					Delete
				</Button>
			</ActionPanelGroup.Section>
		</ActionPanelGroup.Root>
	);
}

export default GridPresetsActionPanelGroup;
