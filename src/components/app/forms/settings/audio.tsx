import { createListCollection } from "@ark-ui/react/collection";

import { ForListCollection } from "$/components/ui/atoms";
import { Field, FieldInput, FieldSelect } from "$/components/ui/compositions";
import { updateProcessingDelay, updateTickType } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAudioProcessingDelay, selectTickType } from "$/store/selectors";
import { Stack, Wrap } from "$:styled-system/jsx";

const TICK_MAP = ["woodblock", "switch"];

const NOTE_TICK_COLLECTION = createListCollection({
	items: TICK_MAP.map((x, i) => ({ value: x, label: ["Woodblock", "Switch"][i] })),
});

function AppAudioSettings() {
	const dispatch = useAppDispatch();
	const processingDelay = useAppSelector(selectAudioProcessingDelay);
	const tickType = useAppSelector(selectTickType);

	return (
		<Stack gap={4}>
			<Wrap gap={2}>
				<Field label="Note tick type" helperText="Change the sound effect played when simulating a hitsound during playback.">
					<FieldSelect value={TICK_MAP[tickType]} onValueChange={(details) => dispatch(updateTickType({ value: TICK_MAP.indexOf(details.valueAsString) }))}>
						<ForListCollection collection={NOTE_TICK_COLLECTION}>
							{(_, { value, label }) => (
								<option key={value} value={value}>
									{label}
								</option>
							)}
						</ForListCollection>
					</FieldSelect>
				</Field>
				<Field label="Processing delay" helperText="Tweak the amount of time, in milliseconds, that the audio should be offset by, for it to seem synchronized. Slower machines should experiment with larger numbers.">
					<FieldInput type="number" value={processingDelay} onValueChange={(details) => dispatch(updateProcessingDelay({ value: details.valueAsNumber }))} />
				</Field>
			</Wrap>
		</Stack>
	);
}

export default AppAudioSettings;
