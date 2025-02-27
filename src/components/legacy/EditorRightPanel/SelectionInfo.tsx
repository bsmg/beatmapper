import { ArrowDownToLineIcon, ArrowUpToLineIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import { Fragment, type MouseEventHandler } from "react";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { copySelection, cutSelection, deselectAll, deselectAllOfType, nudgeSelection, pasteSelection, swapSelectedNotes } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectClipboardHasObjects } from "$/store/selectors";
import { ObjectType, View } from "$/types";
import { getMetaKeyLabel, interleave } from "$/utils";

import Heading from "../Heading";
import IconButton from "../IconButton";
import MiniButton from "../MiniButton";
import Spacer from "../Spacer";
import StrikethroughOnHover from "../StrikethroughOnHover";
import UnstyledButton from "../UnstyledButton";
import ObstacleTweaks from "./ObstacleTweaks";
import UndoRedo from "./UndoRedo";

interface CountProps {
	num: number;
	label: string;
	onClick: MouseEventHandler;
}

const SelectionCount = ({ num, label, onClick }: CountProps) => {
	const pluralizedLabel = num === 1 ? label : `${label}s`;

	return (
		<UnstyledButton display="inline" onClick={onClick}>
			<StrikethroughOnHover>
				<Highlight>{num}</Highlight> {pluralizedLabel}
			</StrikethroughOnHover>
		</UnstyledButton>
	);
};

interface Props {
	numOfSelectedBlocks: number;
	numOfSelectedMines: number;
	numOfSelectedObstacles: number;
}

const SelectionInfo = ({ numOfSelectedBlocks, numOfSelectedMines, numOfSelectedObstacles }: Props) => {
	const hasCopiedNotes = useAppSelector(selectClipboardHasObjects);
	const dispatch = useAppDispatch();

	const hasSelectedObstacles = numOfSelectedObstacles >= 1;

	let numbers = [];
	if (numOfSelectedBlocks) {
		numbers.push(<SelectionCount key="blocks" num={numOfSelectedBlocks} label="block" onClick={() => dispatch(deselectAllOfType({ itemType: ObjectType.NOTE }))} />);
	}
	if (numOfSelectedMines) {
		numbers.push(<SelectionCount key="mines" num={numOfSelectedMines} label="mine" onClick={() => dispatch(deselectAllOfType({ itemType: ObjectType.BOMB }))} />);
	}
	if (numOfSelectedObstacles) {
		numbers.push(<SelectionCount key="obstacles" num={numOfSelectedObstacles} label="wall" onClick={() => dispatch(deselectAllOfType({ itemType: ObjectType.OBSTACLE }))} />);
	}

	numbers = interleave(numbers, ", ");

	const metaKeyLabel = getMetaKeyLabel(navigator);

	return (
		<Wrapper>
			<Heading size={3}>Selection</Heading>
			<Spacer size={token.var("spacing.1.5")} />

			<div>{numbers}</div>

			<Spacer size={token.var("spacing.4")} />

			{hasSelectedObstacles && (
				<Fragment>
					<ObstacleTweaks />
					<Spacer size={token.var("spacing.4")} />
				</Fragment>
			)}

			<Heading size={3}>Actions</Heading>
			<Spacer size={token.var("spacing.1.5")} />

			<Row>
				<Tooltip delay={1000} title="Swap horizontally (H)">
					<IconButton icon={FlipHorizontal2Icon} onClick={() => dispatch(swapSelectedNotes({ axis: "horizontal" }))} />
				</Tooltip>
				<Spacer size={token.var("spacing.1")} />
				<Tooltip delay={1000} title="Swap vertically (V)">
					<IconButton icon={FlipVertical2Icon} onClick={() => dispatch(swapSelectedNotes({ axis: "vertical" }))} />
				</Tooltip>
			</Row>

			<Spacer size={token.var("spacing.1")} />

			<Row>
				<Tooltip delay={1000} title={`Nudge forwards (${metaKeyLabel} + ↑)`}>
					<IconButton icon={ArrowUpToLineIcon} onClick={() => dispatch(nudgeSelection({ direction: "forwards", view: View.BEATMAP }))} />
				</Tooltip>
				<Spacer size={token.var("spacing.1")} />
				<Tooltip delay={1000} title={`Nudge backwards (${metaKeyLabel} + ↓)`}>
					<IconButton icon={ArrowDownToLineIcon} onClick={() => dispatch(nudgeSelection({ direction: "backwards", view: View.BEATMAP }))} />
				</Tooltip>
			</Row>

			<Spacer size={token.var("spacing.2")} />

			<Tooltip delay={1000} title="Clear selection (Escape)">
				<MiniButton width={token.var("sizes.actionPanelFull")} onClick={() => dispatch(deselectAll({ view: View.BEATMAP }))}>
					Deselect
				</MiniButton>
			</Tooltip>
			<Spacer size={token.var("spacing.2")} />

			<UndoRedo />

			<Spacer size={token.var("spacing.2")} />

			<Row>
				<Tooltip delay={1000} title={`copy and remove selection (${getMetaKeyLabel()} + X)`}>
					<MiniButton width={token.var("sizes.actionPanelHalf")} onClick={() => dispatch(cutSelection({ view: View.BEATMAP }))}>
						Cut
					</MiniButton>
				</Tooltip>
				<Spacer size={token.var("spacing.1")} />
				<Tooltip delay={1000} title={`Copy selection (${getMetaKeyLabel()} + C)`}>
					<MiniButton width={token.var("sizes.actionPanelHalf")} onClick={() => dispatch(copySelection({ view: View.BEATMAP }))}>
						Copy
					</MiniButton>
				</Tooltip>
			</Row>

			<Spacer size={token.var("spacing.1")} />

			<Tooltip delay={1000} title={`Paste copied notes and obstacles (${getMetaKeyLabel()} + V)`}>
				<MiniButton width={token.var("sizes.actionPanelFull")} disabled={!hasCopiedNotes} onClick={() => dispatch(pasteSelection({ view: View.BEATMAP }))}>
					Paste
				</MiniButton>
			</Tooltip>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
`;

const Highlight = styled.span`
  color: ${token.var("colors.yellow.500")};
`;

export default SelectionInfo;
