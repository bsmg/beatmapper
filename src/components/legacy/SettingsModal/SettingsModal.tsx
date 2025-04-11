import { createListCollection } from "@ark-ui/react/collection";

import { updateGraphicsLevel, updateProcessingDelay } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAudioProcessingDelay, selectGraphicsQuality } from "$/store/selectors";
import { Quality } from "$/types";
import { capitalize } from "$/utils";

import { Field, FieldInput, RadioGroup } from "$/components/ui/compositions";
import { Fragment } from "react/jsx-runtime";

const QUALITY_LIST_COLLECTION = createListCollection({
	items: Object.values(Quality),
	itemToString: (item) => capitalize(item),
});

const SettingsModal = () => {
	const processingDelay = useAppSelector(selectAudioProcessingDelay);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);
	const dispatch = useAppDispatch();

	return (
		<Fragment>
			<Field cosmetic label="Graphics quality">
				<RadioGroup name="graphics-level" collection={QUALITY_LIST_COLLECTION} value={graphicsLevel} onValueChange={(details) => dispatch(updateGraphicsLevel({ newGraphicsLevel: details.value as Quality }))} />
			</Field>
			<Field label="Processing delay" helperText="Tweak the amount of time, in milliseconds, that the audio should be offset by, for it to seem synchronized. Slower machines should experiment with larger numbers.">
				<FieldInput type="number" value={processingDelay} onValueChange={(details) => dispatch(updateProcessingDelay({ newDelay: details.valueAsNumber }))} />
			</Field>
		</Fragment>
	);
};

export default SettingsModal;
