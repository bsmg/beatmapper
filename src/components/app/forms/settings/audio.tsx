import { Fragment } from "react/jsx-runtime";

import { updateProcessingDelay } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAudioProcessingDelay } from "$/store/selectors";

import { Field, FieldInput } from "$/components/ui/compositions";

function AppAudioSettings() {
	const processingDelay = useAppSelector(selectAudioProcessingDelay);
	const dispatch = useAppDispatch();

	return (
		<Fragment>
			<Field label="Processing delay" helperText="Tweak the amount of time, in milliseconds, that the audio should be offset by, for it to seem synchronized. Slower machines should experiment with larger numbers.">
				<FieldInput type="number" value={processingDelay} onValueChange={(details) => dispatch(updateProcessingDelay({ newDelay: details.valueAsNumber }))} />
			</Field>
		</Fragment>
	);
}

export default AppAudioSettings;
