import { updateBloomEnabled, updateRenderScale } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBloomEnabled, selectRenderScale } from "$/store/selectors";

import { Field, Slider, Switch } from "$/components/ui/compositions";
import { Form } from "$/components/ui/styled";

function AppGraphicsSettings() {
	const dispatch = useAppDispatch();
	const renderScale = useAppSelector(selectRenderScale);
	const isBloomEnabled = useAppSelector(selectBloomEnabled);

	return (
		<Form.Root size="sm">
			<Form.Row>
				<Field cosmetic label="Render Scale" helperText="Reduces the number of components for computationally intensive objects within the view.">
					<Slider name="render-scale" stretch value={[renderScale]} step={0.05} min={0} max={1} onValueChange={(details) => dispatch(updateRenderScale({ value: details.value[0] }))} />
				</Field>
				<Field cosmetic label="Enable Bloom Effect" helperText="Enables/disables the bloom post-processing effect for lighting events.">
					<Switch name="enable-bloom" checked={isBloomEnabled} onCheckedChange={(details) => dispatch(updateBloomEnabled({ checked: details.checked }))} />
				</Field>
			</Form.Row>
		</Form.Root>
	);
}

export default AppGraphicsSettings;
