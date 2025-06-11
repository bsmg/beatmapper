import { updateUsername } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectUsername } from "$/store/selectors";

import { Field, FieldInput } from "$/components/ui/compositions";
import { Form } from "$/components/ui/styled";

function AppUserSettings() {
	const dispatch = useAppDispatch();
	const username = useAppSelector(selectUsername);

	return (
		<Form.Root size="sm">
			<Form.Row>
				<Field label="Username" helperText="Will autopopulate mappers/lighters fields for any new maps/beatmaps that are created.">
					<FieldInput value={username} onValueChange={(details) => dispatch(updateUsername({ value: details.valueAsString }))} />
				</Field>
			</Form.Row>
		</Form.Root>
	);
}

export default AppUserSettings;
