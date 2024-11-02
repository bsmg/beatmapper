import { Fragment, type MouseEventHandler } from "react";
import styled from "styled-components";

import { GRID_PRESET_SLOTS, UNIT } from "$/constants";
import { promptSaveGridPreset } from "$/helpers/prompts.helpers";
import { deleteGridPreset, loadGridPreset, resetGrid, saveGridPreset, updateGrid } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getGridPresets, getGridSize } from "$/store/selectors";

import Center from "../Center";
import Heading from "../Heading";
import MiniButton from "../MiniButton";
import SpacedChildren from "../SpacedChildren";
import Spacer from "../Spacer";
import TextInput from "../TextInput";

interface Props {
	finishTweakingGrid: MouseEventHandler;
}

const GridConfig = ({ finishTweakingGrid }: Props) => {
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector(getGridSize);
	const gridPresets = useAppSelector(getGridPresets);
	const dispatch = useAppDispatch();
	const showPresets = Object.keys(gridPresets).length > 0;

	return (
		<Fragment>
			<Buttons>
				<MiniButton onClick={() => dispatch(resetGrid())}>Reset</MiniButton>
			</Buttons>
			<Spacer size={UNIT * 4} />

			{showPresets && (
				<Center>
					<Heading size={3}>Presets</Heading>
					<Spacer size={UNIT * 1.5} />
					<Row>
						<SpacedChildren>
							{GRID_PRESET_SLOTS.map((slot) => (
								<MiniButton
									key={slot}
									disabled={!gridPresets[slot]}
									onClick={(ev) => {
										if (ev.buttons === 0) {
											dispatch(loadGridPreset({ grid: gridPresets[slot] }));
										}
									}}
									onContextMenu={(ev) => {
										ev.preventDefault();
										dispatch(deleteGridPreset({ presetSlot: slot }));
									}}
								>
									{slot}
								</MiniButton>
							))}
						</SpacedChildren>
					</Row>
					<Spacer size={UNIT * 4} />
				</Center>
			)}

			<Row>
				<TextInput
					type="number"
					min={1}
					max={40}
					label="Columns"
					value={numCols}
					onKeyDown={(ev) => {
						ev.stopPropagation();
					}}
					onChange={(ev) => {
						dispatch(updateGrid({ numCols: Number(ev.target.value), numRows, colWidth, rowHeight }));
					}}
				/>
				<Spacer size={UNIT * 2} />
				<TextInput
					type="number"
					min={1}
					max={11}
					label="Rows"
					value={numRows}
					onKeyDown={(ev) => {
						ev.stopPropagation();
					}}
					onChange={(ev) => {
						dispatch(updateGrid({ numCols, numRows: Number(ev.target.value), colWidth, rowHeight }));
					}}
				/>
			</Row>
			<Spacer size={UNIT * 3} />
			<Row>
				<TextInput
					type="number"
					min={0.1}
					max={4}
					step={0.1}
					label="Cell Width"
					value={colWidth}
					onKeyDown={(ev) => {
						ev.stopPropagation();
					}}
					onChange={(ev) => {
						dispatch(updateGrid({ numCols, numRows, colWidth: Number(ev.target.value), rowHeight }));
					}}
				/>
				<Spacer size={UNIT * 2} />
				<TextInput
					type="number"
					min={0.1}
					max={4}
					step={0.1}
					label="Cell Height"
					value={rowHeight}
					onKeyDown={(ev) => {
						ev.stopPropagation();
					}}
					onChange={(ev) => {
						dispatch(updateGrid({ numCols, numRows, colWidth, rowHeight: Number(ev.target.value) }));
					}}
				/>
			</Row>

			<Spacer size={UNIT * 4} />
			<Buttons>
				<MiniButton onClick={() => dispatch(promptSaveGridPreset(gridPresets, saveGridPreset))}>Save Preset</MiniButton>
				<Spacer size={UNIT * 1} />
				<MiniButton onClick={finishTweakingGrid}>Finish Customizing</MiniButton>
			</Buttons>
		</Fragment>
	);
};

const Row = styled.div`
  display: flex;

  label {
    flex: 1;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  i,
  svg {
    display: block !important;
  }
`;

export default GridConfig;
