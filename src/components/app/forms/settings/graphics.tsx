import { createListCollection } from "@ark-ui/react/collection";
import { Fragment } from "react/jsx-runtime";

import { updateGraphicsLevel } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality } from "$/store/selectors";
import { Quality } from "$/types";
import { capitalize } from "$/utils";

import { Field, RadioGroup } from "$/components/ui/compositions";

const QUALITY_LIST_COLLECTION = createListCollection({
	items: Object.values(Quality),
	itemToString: (item) => capitalize(item),
});

function AppGraphicsSettings() {
	const graphicsLevel = useAppSelector(selectGraphicsQuality);
	const dispatch = useAppDispatch();
	return (
		<Fragment>
			<Field cosmetic label="Graphics quality">
				<RadioGroup name="graphics-level" collection={QUALITY_LIST_COLLECTION} value={graphicsLevel} onValueChange={(details) => dispatch(updateGraphicsLevel({ newGraphicsLevel: details.value as Quality }))} />
			</Field>
		</Fragment>
	);
}

export default AppGraphicsSettings;
