import { Field, FieldInput } from "$/components/ui/compositions";
import { updateUsername } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectUsername } from "$/store/selectors";
import { Stack, Wrap } from "$:styled-system/jsx";

function AppUserSettings() {
	const dispatch = useAppDispatch();
	const username = useAppSelector(selectUsername);

	return (
		<Stack gap={4}>
			<Wrap gap={2}>
				<Field label="Username" helperText="Will autopopulate mappers/lighters fields for any new maps/beatmaps that are created.">
					<FieldInput value={username} onValueChange={(details) => dispatch(updateUsername({ value: details.valueAsString }))} />
				</Field>
			</Wrap>
		</Stack>
	);
}

export default AppUserSettings;
