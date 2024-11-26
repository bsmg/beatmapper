import { Fragment, type MouseEventHandler } from "react";
import styled from "styled-components";

import { GRID_PRESET_SLOTS, UNIT } from "$/constants";
import { promptSaveGridPreset } from "$/helpers/prompts.helpers";
import { deleteGridPreset, loadGridPreset, resetGrid, saveGridPreset, updateGrid } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getGridPresets, selectActiveSongId, selectGridSize } from "$/store/selectors";

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
	const songId = useAppSelector(selectActiveSongId);
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, songId));
	const gridPresets = useAppSelector(getGridPresets);
	const dispatch = useAppDispatch();
	const showPresets = Object.keys(gridPresets).length > 0;

	return (
		<Fragment>
			<Buttons>
				<MiniButton onClick={() => songId && dispatch(resetGrid({ songId }))}>Reset</MiniButton>
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
											songId && dispatch(loadGridPreset({ songId, grid: gridPresets[slot] }));
										}
									}}
									onContextMenu={(ev) => {
										ev.preventDefault();
										songId && dispatch(deleteGridPreset({ songId, presetSlot: slot }));
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
						songId && dispatch(updateGrid({ songId, grid: { numCols: Number(ev.target.value) } }));
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
						songId && dispatch(updateGrid({ songId, grid: { numRows: Number(ev.target.value) } }));
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
						songId && dispatch(updateGrid({ songId, grid: { colWidth: Number(ev.target.value) } }));
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
						songId && dispatch(updateGrid({ songId, grid: { rowHeight: Number(ev.target.value) } }));
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
