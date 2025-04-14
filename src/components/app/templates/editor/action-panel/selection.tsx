import { ArrowDownToLineIcon, ArrowUpToLineIcon, DotIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import { Fragment, type MouseEventHandler, useMemo } from "react";

import { deselectAll, deselectAllOfType, nudgeSelection, swapSelectedNotes } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { ObjectType, type SongId, View } from "$/types";
import { getMetaKeyLabel } from "$/utils";

import { ActionPanelGroup } from "$/components/app/layouts";
import { ClipboardActionPanelActionGroup, HistoryActionPanelActionGroup, ObstaclesActionPanelGroup } from "$/components/app/templates/action-panel-groups";
import { Interleave } from "$/components/ui/atoms";
import { Button, StrikethroughOnHover, Text, Tooltip } from "$/components/ui/compositions";

interface CountProps {
	num: number;
	label: string;
	onClick: MouseEventHandler;
}
function SelectionCount({ num, label, onClick }: CountProps) {
	const pluralizedLabel = useMemo(() => (num === 1 ? label : `${label}s`), [num, label]);

	return (
		<Button onClick={onClick}>
			<StrikethroughOnHover>
				<Text colorPalette="yellow" color={"colorPalette.500"} fontWeight={"bold"}>
					{num}
				</Text>{" "}
				{pluralizedLabel}
			</StrikethroughOnHover>
		</Button>
	);
}

interface Props {
	sid: SongId;
	numOfSelectedBlocks: number;
	numOfSelectedMines: number;
	numOfSelectedObstacles: number;
}
function SelectionActionPanel({ sid, numOfSelectedBlocks, numOfSelectedMines, numOfSelectedObstacles }: Props) {
	const dispatch = useAppDispatch();

	const hasSelectedObstacles = useMemo(() => numOfSelectedObstacles >= 1, [numOfSelectedObstacles]);

	const numbers = [];
	if (numOfSelectedBlocks) {
		numbers.push(<SelectionCount key="blocks" num={numOfSelectedBlocks} label="block" onClick={() => dispatch(deselectAllOfType({ itemType: ObjectType.NOTE }))} />);
	}
	if (numOfSelectedMines) {
		numbers.push(<SelectionCount key="mines" num={numOfSelectedMines} label="mine" onClick={() => dispatch(deselectAllOfType({ itemType: ObjectType.BOMB }))} />);
	}
	if (numOfSelectedObstacles) {
		numbers.push(<SelectionCount key="obstacles" num={numOfSelectedObstacles} label="wall" onClick={() => dispatch(deselectAllOfType({ itemType: ObjectType.OBSTACLE }))} />);
	}

	const metaKeyLabel = useMemo(() => getMetaKeyLabel(navigator), []);

	return (
		<Fragment>
			<ActionPanelGroup.Root label="Selection">
				<ActionPanelGroup.ActionGroup>
					<Interleave separator={() => <DotIcon size={16} />}>{numbers}</Interleave>
				</ActionPanelGroup.ActionGroup>
			</ActionPanelGroup.Root>
			{hasSelectedObstacles && <ObstaclesActionPanelGroup sid={sid} />}
			<ActionPanelGroup.Root label="Actions">
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => "Swap horizontally (H)"}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(swapSelectedNotes({ axis: "horizontal" }))}>
							<FlipHorizontal2Icon />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Swap vertically (V)"}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(swapSelectedNotes({ axis: "vertical" }))}>
							<FlipVertical2Icon />
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => `Nudge forwards (${metaKeyLabel} + ↑)`}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(nudgeSelection({ direction: "forwards", view: View.BEATMAP }))}>
							<ArrowUpToLineIcon />
						</Button>
					</Tooltip>
					<Tooltip render={() => `Nudge backwards (${metaKeyLabel} + ↓)`}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(nudgeSelection({ direction: "backwards", view: View.BEATMAP }))}>
							<ArrowDownToLineIcon />
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => "Clear selection (Escape)"}>
						<Button variant="subtle" size="sm" onClick={() => dispatch(deselectAll({ view: View.BEATMAP }))}>
							Deselect
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
				<HistoryActionPanelActionGroup />
				<ClipboardActionPanelActionGroup />
			</ActionPanelGroup.Root>
		</Fragment>
	);
}

export default SelectionActionPanel;
