import { Fragment } from "react/jsx-runtime";

import { updateUsername } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectUsername } from "$/store/selectors";

import { Field, FieldInput } from "$/components/ui/compositions";

function AppUserSettings() {
	const username = useAppSelector(selectUsername);
	const dispatch = useAppDispatch();

	return (
		<Fragment>
			<Field label="Username">
				<FieldInput value={username} onValueChange={(details) => dispatch(updateUsername({ value: details.valueAsString }))} />
			</Field>
		</Fragment>
	);
}

export default AppUserSettings;
