import { createListCollection } from "@ark-ui/react/collection";
import { usePressedKeys } from "@ark-ui/react/hotkeys";
import { SquareDashedIcon, SquarePlusIcon } from "lucide-react";
import { useEffect } from "react";

import { Field, ToggleGroup } from "$/components/ui/compositions";
import { updateEventsEditorEditMode } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectEventsEditorEditMode } from "$/store/selectors";
import { EventEditMode } from "$/types";

const EDIT_MODE_LIST_COLLECTION = createListCollection({
	items: Object.values(EventEditMode).map((value, index) => {
		const Icon = [SquarePlusIcon, SquareDashedIcon][index];
		return { value, label: <Icon size={16} /> };
	}),
});

function EditModeControls() {
	const dispatch = useAppDispatch();
	const selectedEditMode = useAppSelector(selectEventsEditorEditMode);

	const pressedKeys = usePressedKeys();

	useEffect(() => {
		dispatch(updateEventsEditorEditMode(pressedKeys.includes("Shift") ? EventEditMode.SELECT : EventEditMode.PLACE));
	}, [dispatch, pressedKeys]);

	return (
		<Field cosmetic size="sm" label="Edit Mode">
			<ToggleGroup collection={EDIT_MODE_LIST_COLLECTION} unfocusOnPress value={[selectedEditMode]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorEditMode(details.value[0] as EventEditMode))} />
		</Field>
	);
}

export default EditModeControls;
