import { createListCollection } from "@ark-ui/react/collection";

import { Field, FieldSelectGroup } from "$/components/ui/compositions";
import { updateTickType } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectTickType } from "$/store/selectors";
import { Stack, Wrap } from "$:styled-system/jsx";

const TICK_MAP = ["woodblock", "switch"];

const NOTE_TICK_COLLECTION = createListCollection({
	items: TICK_MAP.map((x, i) => ({ value: x, label: ["Woodblock", "Switch"][i] })),
});

function AppAudioSettings() {
	const dispatch = useAppDispatch();
	const tickType = useAppSelector(selectTickType);

	return (
		<Stack gap={4}>
			<Wrap gap={2}>
				<Field label="Note tick type" helperText="Change the sound effect played when simulating a hitsound during playback.">
					<FieldSelectGroup collection={NOTE_TICK_COLLECTION} value={TICK_MAP[tickType]} onValueChange={(details) => dispatch(updateTickType(TICK_MAP.indexOf(details.valueAsString)))} />
				</Field>
			</Wrap>
		</Stack>
	);
}

export default AppAudioSettings;
