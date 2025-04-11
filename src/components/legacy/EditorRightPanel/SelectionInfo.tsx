import { ArrowDownToLineIcon, ArrowUpToLineIcon, DotIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import type { MouseEventHandler } from "react";

import { copySelection, cutSelection, deselectAll, deselectAllOfType, nudgeSelection, pasteSelection, swapSelectedNotes } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectClipboardHasObjects } from "$/store/selectors";
import { ObjectType, View } from "$/types";
import { getMetaKeyLabel } from "$/utils";

import { VStack, Wrap } from "$:styled-system/jsx";
import { Interleave } from "$/components/ui/atoms";
import { Button, Heading, StrikethroughOnHover, Text, Tooltip } from "$/components/ui/compositions";
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
		<Button onClick={onClick}>
			<StrikethroughOnHover>
				<Text colorPalette="yellow" color={"colorPalette.500"} fontWeight={"bold"}>
					{num}
				</Text>{" "}
				{pluralizedLabel}
			</StrikethroughOnHover>
		</Button>
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

	const metaKeyLabel = getMetaKeyLabel(navigator);

	return (
		<VStack gap={4}>
			<VStack gap={1.5}>
				<Heading rank={3}>Selection</Heading>
				<Wrap gap={1} justify={"center"}>
					<Interleave separator={() => <DotIcon size={16} />}>{numbers}</Interleave>
				</Wrap>
			</VStack>
			{hasSelectedObstacles && <ObstacleTweaks />}
			<VStack gap={1.5}>
				<Heading rank={3}>Actions</Heading>
				<VStack gap={2}>
					<Wrap gap={1} justify={"center"}>
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
					</Wrap>
					<Tooltip render={() => "Clear selection (Escape)"}>
						<Button variant="subtle" size="sm" onClick={() => dispatch(deselectAll({ view: View.BEATMAP }))}>
							Deselect
						</Button>
					</Tooltip>
					<UndoRedo />
					<Wrap gap={1} justify={"center"}>
						<Tooltip render={() => `Copy and remove selection (${getMetaKeyLabel()} + X)`}>
							<Button variant="subtle" size="sm" onClick={() => dispatch(cutSelection({ view: View.BEATMAP }))}>
								Cut
							</Button>
						</Tooltip>
						<Tooltip render={() => `Copy selection (${getMetaKeyLabel()} + C)`}>
							<Button variant="subtle" size="sm" onClick={() => dispatch(copySelection({ view: View.BEATMAP }))}>
								Copy
							</Button>
						</Tooltip>
						<Tooltip render={() => `Paste copied notes and obstacles (${getMetaKeyLabel()} + V)`}>
							<Button variant="subtle" size="sm" disabled={!hasCopiedNotes} onClick={() => dispatch(pasteSelection({ view: View.BEATMAP }))}>
								Paste
							</Button>
						</Tooltip>
					</Wrap>
				</VStack>
			</VStack>
		</VStack>
	);
};

export default SelectionInfo;
