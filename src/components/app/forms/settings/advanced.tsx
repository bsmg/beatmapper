import { Field, FieldInput } from "$/components/ui/compositions";
import { Form } from "$/components/ui/styled";
import { updatePacerWait } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectPacerWait } from "$/store/selectors";

function AppAdvancedSettings() {
	const dispatch = useAppDispatch();
	const wait = useAppSelector(selectPacerWait);

	return (
		<Form.Root size="sm">
			<Form.Row>
				<Field label="Event update rate" helperText="Controls how often debounced/throttled events will fire (in milliseconds). A lower value will make certain elements more responsive, with the trade-off being a greater impact on performance.">
					<FieldInput type="number" value={wait} onValueChange={(x) => dispatch(updatePacerWait({ value: x.valueAsNumber }))} />
				</Field>
			</Form.Row>
		</Form.Root>
	);
}

export default AppAdvancedSettings;
