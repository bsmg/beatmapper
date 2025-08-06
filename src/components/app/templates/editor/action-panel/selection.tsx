import { ArrowDownToLineIcon, ArrowUpToLineIcon, DotIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import { Fragment, type MouseEventHandler, useMemo } from "react";

import { ActionPanelGroup } from "$/components/app/layouts";
import { ClipboardActionPanelActionGroup, HistoryActionPanelActionGroup, ObstaclesActionPanelGroup } from "$/components/app/templates/action-panel-groups";
import { Interleave } from "$/components/ui/atoms";
import { Button, StrikethroughOnHover, Text, Tooltip } from "$/components/ui/compositions";
import { deselectAllEntities, deselectAllEntitiesOfType, mirrorSelection, nudgeSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridSize } from "$/store/selectors";
import { ObjectType, type SongId, View } from "$/types";

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
	const grid = useAppSelector((state) => selectGridSize(state, sid));

	const hasSelectedObstacles = useMemo(() => numOfSelectedObstacles >= 1, [numOfSelectedObstacles]);

	const numbers = [];
	if (numOfSelectedBlocks) {
		numbers.push(<SelectionCount key="blocks" num={numOfSelectedBlocks} label="note" onClick={() => dispatch(deselectAllEntitiesOfType({ itemType: ObjectType.NOTE }))} />);
	}
	if (numOfSelectedMines) {
		numbers.push(<SelectionCount key="mines" num={numOfSelectedMines} label="bomb" onClick={() => dispatch(deselectAllEntitiesOfType({ itemType: ObjectType.BOMB }))} />);
	}
	if (numOfSelectedObstacles) {
		numbers.push(<SelectionCount key="obstacles" num={numOfSelectedObstacles} label="obstacle" onClick={() => dispatch(deselectAllEntitiesOfType({ itemType: ObjectType.OBSTACLE }))} />);
	}

	return (
		<Fragment>
			<ActionPanelGroup.Root label="Selection">
				<ActionPanelGroup.ActionGroup gap="sm">
					<Interleave separator={() => <DotIcon size={16} />}>{numbers}</Interleave>
				</ActionPanelGroup.ActionGroup>
			</ActionPanelGroup.Root>
			{hasSelectedObstacles && <ObstaclesActionPanelGroup sid={sid} />}
			<ActionPanelGroup.Root label="Actions">
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => "Mirror selection horizontally"}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(mirrorSelection({ axis: "horizontal", grid }))}>
							<FlipHorizontal2Icon />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Mirror selection vertically"}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(mirrorSelection({ axis: "vertical", grid }))}>
							<FlipVertical2Icon />
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => "Nudge selection forwards"}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(nudgeSelection({ direction: "forwards", view: View.BEATMAP }))}>
							<ArrowUpToLineIcon />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Nudge selection backwards"}>
						<Button variant="ghost" size="icon" onClick={() => dispatch(nudgeSelection({ direction: "backwards", view: View.BEATMAP }))}>
							<ArrowDownToLineIcon />
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
				<ActionPanelGroup.ActionGroup>
					<Button variant="subtle" size="sm" onClick={() => dispatch(deselectAllEntities({ view: View.BEATMAP }))}>
						Clear selection
					</Button>
				</ActionPanelGroup.ActionGroup>
				<HistoryActionPanelActionGroup sid={sid} />
				<ClipboardActionPanelActionGroup sid={sid} />
			</ActionPanelGroup.Root>
		</Fragment>
	);
}

export default SelectionActionPanel;
