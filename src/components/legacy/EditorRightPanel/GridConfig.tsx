import type { MouseEventHandler } from "react";

import { GRID_PRESET_SLOTS } from "$/constants";
import { promptSaveGridPreset } from "$/helpers/prompts.helpers";
import { deleteGridPreset, loadGridPreset, resetGrid, saveGridPreset, updateGrid } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectGridPresets, selectGridSize } from "$/store/selectors";

import { VStack, Wrap } from "$:styled-system/jsx";
import { Button, Field, FieldInput, Heading } from "$/components/ui/compositions";

interface Props {
	finishTweakingGrid: MouseEventHandler;
}

const GridConfig = ({ finishTweakingGrid }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, songId));
	const gridPresets = useAppSelector(selectGridPresets);
	const dispatch = useAppDispatch();
	const showPresets = Object.keys(gridPresets).length > 0;

	return (
		<VStack gap={4}>
			<Button variant="subtle" size="sm" onClick={() => songId && dispatch(resetGrid({ songId }))}>
				Reset
			</Button>
			{showPresets && (
				<VStack gap={1.5}>
					<Heading rank={3}>Presets</Heading>
					<Wrap gap={1} justify={"center"}>
						{GRID_PRESET_SLOTS.map((slot) => (
							<Button
								key={slot}
								variant="subtle"
								size="sm"
								disabled={!gridPresets[slot]}
								onClick={(ev) => {
									if (ev.buttons === 0) {
										songId && dispatch(loadGridPreset({ songId, grid: gridPresets[slot] }));
									}
								}}
								onContextMenu={(ev) => {
									ev.preventDefault();
									songId && dispatch(deleteGridPreset({ songId, presetSlot: slot }));
								}}
							>
								{slot}
							</Button>
						))}
					</Wrap>
				</VStack>
			)}
			<Wrap gap={1}>
				<Field label="Columns">
					<FieldInput type="number" min={1} max={40} value={numCols} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => songId && dispatch(updateGrid({ songId, grid: { numCols: details.valueAsNumber } }))} />
				</Field>
				<Field label="Rows">
					<FieldInput type="number" min={1} max={11} value={numRows} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => songId && dispatch(updateGrid({ songId, grid: { numRows: details.valueAsNumber } }))} />
				</Field>
				<Field label="Cell Width">
					<FieldInput type="number" min={0.1} max={4} step={0.1} value={colWidth} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => songId && dispatch(updateGrid({ songId, grid: { colWidth: details.valueAsNumber } }))} />
				</Field>
				<Field label="Cell Height">
					<FieldInput type="number" min={0.1} max={4} step={0.1} value={rowHeight} onKeyDown={(ev) => ev.stopPropagation()} onValueChange={(details) => songId && dispatch(updateGrid({ songId, grid: { rowHeight: details.valueAsNumber } }))} />
				</Field>
			</Wrap>
			<Wrap gap={1}>
				<Button variant="subtle" size="sm" onClick={() => dispatch(promptSaveGridPreset(gridPresets, saveGridPreset))}>
					Save Preset
				</Button>
				<Button variant="subtle" size="sm" onClick={finishTweakingGrid}>
					Finish Customizing
				</Button>
			</Wrap>
		</VStack>
	);
};

export default GridConfig;
