import { createListCollection } from "@ark-ui/react/collection";
import { toPascalCase } from "@std/text/to-pascal-case";

import { Field, FieldInput, RadioGroup } from "$/components/ui/compositions";
import { updateHighestPrecision, updateNotesEditorAngleOffsetStep, updateObstaclePlacementMode, updateWindowSize } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectHighestPrecision, selectNotesEditorAngleOffsetStep, selectUserObstaclePlacementMode, selectWindowSize } from "$/store/selectors";
import { ObstaclePlacementMode } from "$/types";
import { Stack, Wrap } from "$:styled-system/jsx";

const OBSTACLE_PLACEMENT_MODE_COLLECTION = createListCollection({
	items: [ObstaclePlacementMode.LEGACY, ObstaclePlacementMode.MODERN, ObstaclePlacementMode.VISUAL],
	itemToString: toPascalCase,
});

function AppControlsSettings() {
	const dispatch = useAppDispatch();
	const obstaclePlacementMode = useAppSelector(selectUserObstaclePlacementMode);
	const windowSize = useAppSelector(selectWindowSize);
	const highestPrecision = useAppSelector(selectHighestPrecision);
	const angleOffsetStep = useAppSelector(selectNotesEditorAngleOffsetStep);

	return (
		<Stack gap={4}>
			<Wrap gap={2}>
				<Field label="Navigation Window Size" helperText="The distance (in beats) for window navigation actions within object-focused views.">
					<FieldInput type="number" min={1} max={32} value={windowSize} onValueChange={(x) => dispatch(updateWindowSize(x.valueAsNumber))} />
				</Field>
				<Field label="Highest Precision" helperText="The smallest allowable beat subdivision to use for navigation and placement controls.">
					<FieldInput type="number" min={0.015625} max={1} step="any" value={highestPrecision} onValueChange={(x) => dispatch(updateHighestPrecision(x.valueAsNumber))} />
				</Field>
				<Field label="Angle Offset Delta" helperText="The step size used when modifying angle offset for color notes.">
					<FieldInput type="number" min={5} max={90} step="any" value={angleOffsetStep} onValueChange={(x) => dispatch(updateNotesEditorAngleOffsetStep(x.valueAsNumber))} />
				</Field>
				<Field label="Obstacle Placement Mode" helperText="Determines the behavior of how obstacles are placed along the grid. [Learn more](/docs/manual/notes#obstacle-placement-modes)">
					<RadioGroup collection={OBSTACLE_PLACEMENT_MODE_COLLECTION} value={obstaclePlacementMode} onValueChange={(x) => dispatch(updateObstaclePlacementMode(x.value as ObstaclePlacementMode))} />
				</Field>
			</Wrap>
		</Stack>
	);
}

export default AppControlsSettings;
