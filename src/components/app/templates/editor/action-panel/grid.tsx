import { Fragment, type MouseEventHandler } from "react";

import { DEFAULT_GRID, GRID_PRESET_SLOTS } from "$/constants";
import { promptSaveGridPreset } from "$/helpers/prompts.helpers";
import { loadGridPreset, removeGridPreset, updateGridSize } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridPresets, selectGridSize } from "$/store/selectors";
import type { SongId } from "$/types";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Field, FieldInput } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
	finishTweakingGrid: MouseEventHandler;
}
function GridActionPanel({ sid, finishTweakingGrid }: Props) {
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, sid));
	const gridPresets = useAppSelector(selectGridPresets);
	const dispatch = useAppDispatch();
	const showPresets = Object.keys(gridPresets).length > 0;

	return (
		<Fragment>
			<Button variant="subtle" size="sm" onClick={() => sid && dispatch(updateGridSize({ songId: sid, changes: DEFAULT_GRID }))}>
				Reset
			</Button>
			{showPresets && (
				<ActionPanelGroup.Root label="Presets">
					<ActionPanelGroup.ActionGroup>
						{GRID_PRESET_SLOTS.map((slot) => (
							<Button
								key={slot}
								variant="subtle"
								size="sm"
								disabled={!gridPresets[slot]}
								onClick={(ev) => {
									if (ev.buttons === 0) {
										sid && dispatch(loadGridPreset({ songId: sid, grid: gridPresets[slot] }));
									}
								}}
								onContextMenu={(ev) => {
									ev.preventDefault();
									sid && dispatch(removeGridPreset({ songId: sid, presetSlot: slot }));
								}}
							>
								{slot}
							</Button>
						))}
					</ActionPanelGroup.ActionGroup>
				</ActionPanelGroup.Root>
			)}
			<ActionPanelGroup.ActionGroup gap={"lg"}>
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
				<Button variant="subtle" size="sm" onClick={() => dispatch(promptSaveGridPreset(gridPresets, { songId: sid }))}>
					Save Preset
				</Button>
				<Button variant="subtle" size="sm" onClick={finishTweakingGrid}>
					Finish Customizing
				</Button>
			</ActionPanelGroup.ActionGroup>
		</Fragment>
	);
}

export default GridActionPanel;
