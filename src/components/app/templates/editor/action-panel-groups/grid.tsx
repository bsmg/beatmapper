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
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, sid));

	const { trigger: triggerSaveGridPreset } = usePrompt({
		title: "Save Grid Preset",
		description: "Saves your current grid settings to a preset.",
		defaultValues: { slot: "" },
		validate: object({ slot: pipe(string(), nonEmpty()) }),
		render: ({ form }) => <form.AppField name="slot">{(ctx) => <ctx.Input label="Preset Name" />}</form.AppField>,
		onSubmit: ({ value }) => {
			return dispatch(saveGridPreset({ songId: sid, presetSlot: value.slot }));
		},
	});

	return (
		<ActionPanelGroup.Root label="Customize Grid">
			<ActionPanelGroup.ActionGroup />
			<ActionPanelGroup.ActionGroup gap="lg">
				<Field label="Columns">
					<FieldInput type="number" min={1} value={numCols} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => sid && dispatch(updateGridSize({ songId: sid, changes: { numCols: details.valueAsNumber } }))} />
				</Field>
				<Field label="Rows">
					<FieldInput type="number" min={1} value={numRows} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => sid && dispatch(updateGridSize({ songId: sid, changes: { numRows: details.valueAsNumber } }))} />
				</Field>
				<Field label="Cell Width">
					<FieldInput type="number" min={0.1} step={0.1} value={colWidth} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => sid && dispatch(updateGridSize({ songId: sid, changes: { colWidth: details.valueAsNumber } }))} />
				</Field>
				<Field label="Cell Height">
					<FieldInput type="number" min={0.1} step={0.1} value={rowHeight} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => sid && dispatch(updateGridSize({ songId: sid, changes: { rowHeight: details.valueAsNumber } }))} />
				</Field>
			</ActionPanelGroup.ActionGroup>
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" unfocusOnPress onClick={triggerSaveGridPreset}>
					Save as Preset
				</Button>
				<Button variant="subtle" size="sm" unfocusOnPress onClick={() => sid && dispatch(updateGridSize({ songId: sid, changes: DEFAULT_GRID }))}>
					Reset Grid
				</Button>
				<Button variant="subtle" size="sm" unfocusOnPress onClick={finishTweakingGrid}>
					Finish Customizing
				</Button>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default GridActionPanelGroup;
