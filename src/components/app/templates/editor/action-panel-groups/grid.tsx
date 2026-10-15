import { useParams } from "@tanstack/react-router";
import type { MouseEventHandler } from "react";
import { nonEmpty, object, pipe, string } from "valibot";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Field, FieldInput, usePrompt } from "$/components/ui/compositions";
import { DEFAULT_GRID } from "$/constants";
import { saveGridPreset, updateGridSize } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridSize } from "$/store/selectors";

interface Props {
	finishTweakingGrid: MouseEventHandler;
}
function GridActionPanelGroup({ finishTweakingGrid }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const { numRows, numCols, colWidth, rowHeight, colOffset, rowOffset } = useAppSelector((state) => selectGridSize(state, sid));

	const { trigger: triggerSaveGridPreset } = usePrompt({
		title: "Save Grid Preset",
		description: "Saves your current grid settings to a preset.",
		defaultValues: { slot: "" },
		validate: object({ slot: pipe(string(), nonEmpty()) }),
		render: ({ form }) => <form.AppField name="slot">{(ctx) => <ctx.Input label="Preset Name" />}</form.AppField>,
		onSubmit: ({ value }) => {
			return dispatch(saveGridPreset({ slot: value.slot }));
		},
	});

	return (
		<ActionPanelGroup.Root label="Customize Grid">
			<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(updateGridSize({ songId: sid, changes: DEFAULT_GRID }))}>
				Revert to Default
			</Button>
			<ActionPanelGroup.Section gap="lg">
				<Field label="Columns">
					<FieldInput type="number" min={1} value={numCols} onValueChange={(details) => dispatch(updateGridSize({ songId: sid, changes: { numCols: details.valueAsNumber } }))} />
				</Field>
				<Field label="Rows">
					<FieldInput type="number" min={1} value={numRows} onValueChange={(details) => dispatch(updateGridSize({ songId: sid, changes: { numRows: details.valueAsNumber } }))} />
				</Field>
				<Field label="Width">
					<FieldInput type="number" min={0.1} step={0.1} value={colWidth} onValueChange={(details) => dispatch(updateGridSize({ songId: sid, changes: { colWidth: details.valueAsNumber } }))} />
				</Field>
				<Field label="Height">
					<FieldInput type="number" min={0.1} step={0.1} value={rowHeight} onValueChange={(details) => dispatch(updateGridSize({ songId: sid, changes: { rowHeight: details.valueAsNumber } }))} />
				</Field>
				<Field label="X Offset">
					<FieldInput type="number" step={0.25} value={colOffset} onValueChange={(details) => dispatch(updateGridSize({ songId: sid, changes: { colOffset: details.valueAsNumber } }))} />
				</Field>
				<Field label="Y Offset">
					<FieldInput type="number" step={0.25} value={rowOffset} onValueChange={(details) => dispatch(updateGridSize({ songId: sid, changes: { rowOffset: details.valueAsNumber } }))} />
				</Field>
			</ActionPanelGroup.Section>
			<Button variant="subtle" size="sm" unfocusOnPress onClick={triggerSaveGridPreset}>
				Save to Preset
			</Button>
			<Button variant="subtle" size="sm" unfocusOnPress onClick={finishTweakingGrid}>
				Finish Customizing
			</Button>
		</ActionPanelGroup.Root>
	);
}

export default GridActionPanelGroup;
