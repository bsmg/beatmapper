import { createListCollection } from "@ark-ui/react/collection";
import { toPascalCase } from "@std/text/to-pascal-case";

import { Field, RadioGroup } from "$/components/ui/compositions";
import { updateObstaclePlacementMode } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectUserObstaclePlacementMode } from "$/store/selectors";
import { ObstaclePlacementMode } from "$/types";
import { Stack, Wrap } from "$:styled-system/jsx";

const OBSTACLE_PLACEMENT_MODE_COLLECTION = createListCollection({
	items: [ObstaclePlacementMode.LEGACY, ObstaclePlacementMode.MODERN, ObstaclePlacementMode.VISUAL],
	itemToString: toPascalCase,
});

function AppControlsSettings() {
	const dispatch = useAppDispatch();
	const obstaclePlacementMode = useAppSelector(selectUserObstaclePlacementMode);

	return (
		<Stack gap={4}>
			<Wrap gap={2}>
				<Field label="Obstacle Placement Mode" helperText="Determines the behavior of how obstacles are placed along the grid. [Learn more](/docs/manual/notes#obstacle-placement-modes)">
					<RadioGroup collection={OBSTACLE_PLACEMENT_MODE_COLLECTION} value={obstaclePlacementMode} onValueChange={(x) => dispatch(updateObstaclePlacementMode(x.value as ObstaclePlacementMode))} />
				</Field>
			</Wrap>
		</Stack>
	);
}

export default AppControlsSettings;
