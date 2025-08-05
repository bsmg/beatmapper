import { Fragment, type MouseEventHandler, useState } from "react";

import { DEFAULT_GRID } from "$/constants";
import { loadGridPreset, removeGridPreset, updateGridSize } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridPresets, selectGridSize } from "$/store/selectors";
import type { SongId } from "$/types";

import { useAppPrompterContext } from "$/components/app/compositions";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, Field, FieldInput, Select, Tooltip } from "$/components/ui/compositions";
import { isObjectEmpty } from "$/utils";
import { createListCollection } from "@ark-ui/react";
import { ArrowUpFromDotIcon, TrashIcon } from "lucide-react";

interface Props {
	sid: SongId;
	finishTweakingGrid: MouseEventHandler;
}
function GridActionPanel({ sid, finishTweakingGrid }: Props) {
	const dispatch = useAppDispatch();
	const { numRows, numCols, colWidth, rowHeight } = useAppSelector((state) => selectGridSize(state, sid));
	const gridPresets = useAppSelector(selectGridPresets);

	const [slot, setSlot] = useState<string>("");

	const { openPrompt } = useAppPrompterContext();

	return (
		<Fragment>
			{!isObjectEmpty(gridPresets) && (
				<ActionPanelGroup.Root label="Grid Presets">
					<ActionPanelGroup.ActionGroup>
						<Select collection={createListCollection({ items: Object.keys(gridPresets) })} value={[slot]} onValueChange={(x) => setSlot(x.value[0])} />
					</ActionPanelGroup.ActionGroup>
					<ActionPanelGroup.ActionGroup>
						<Tooltip render={() => "Load Grid Preset"}>
							<Button variant="subtle" size="sm" disabled={!gridPresets[slot]} onClick={() => dispatch(loadGridPreset({ songId: sid, grid: gridPresets[slot] }))}>
								<ArrowUpFromDotIcon size={16} />
							</Button>
						</Tooltip>
						<Tooltip render={() => "Delete Grid Preset"}>
							<Button variant="subtle" size="sm" disabled={!gridPresets[slot]} onClick={() => dispatch(removeGridPreset({ songId: sid, presetSlot: slot }))}>
								<TrashIcon size={16} />
							</Button>
						</Tooltip>
					</ActionPanelGroup.ActionGroup>
				</ActionPanelGroup.Root>
			)}
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
					<Button variant="subtle" size="sm" onClick={() => openPrompt("SAVE_GRID_PRESET")}>
						Save as Preset
					</Button>
					<Button variant="subtle" size="sm" onClick={() => sid && dispatch(updateGridSize({ songId: sid, changes: DEFAULT_GRID }))}>
						Reset Grid
					</Button>
					<Button variant="subtle" size="sm" onClick={finishTweakingGrid}>
						Finish Customizing
					</Button>
				</ActionPanelGroup.ActionGroup>
			</ActionPanelGroup.Root>
		</Fragment>
	);
}

export default GridActionPanel;
