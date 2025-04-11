import { createListCollection } from "@ark-ui/react/collection";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";

import { SNAPPING_INCREMENTS } from "$/constants";
import { changeSnapping, pausePlaying, seekBackwards, seekForwards, skipToEnd, skipToStart, startPlaying } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectIsLoading, selectIsPlaying, selectSnapTo } from "$/store/selectors";
import type { View } from "$/types";

import { HStack, styled } from "$:styled-system/jsx";
import { Button, Select } from "$/components/ui/compositions";
import CurrentBeat from "./CurrentBeat";
import CurrentTime from "./CurrentTime";

const SNAPPING_INCREMENT_LIST_COLLECTION = createListCollection({
	items: SNAPPING_INCREMENTS.map((item) => {
		const label = item.shortcutKey ? `${item.label} (${item.shortcutLabel})` : item.label;
		return { value: item.value.toString(), label };
	}),
});

interface Props {
	view: View;
}
const EditorNavigationControls = ({ view }: Props) => {
	const isPlaying = useAppSelector(selectIsPlaying);
	const isLoadingSong = useAppSelector(selectIsLoading);
	const snapTo = useAppSelector(selectSnapTo);
	const dispatch = useAppDispatch();

	const playButtonAction = isPlaying ? pausePlaying : startPlaying;

	return (
		<HStack justify={"space-between"}>
			<Column gap={4} justify={"flex-start"}>
				<Select collection={SNAPPING_INCREMENT_LIST_COLLECTION} value={[snapTo.toString()]} onValueChange={(ev) => dispatch(changeSnapping({ newSnapTo: Number(ev.value[0]) }))}>
					Snap To
				</Select>
			</Column>
			<Column gap={1} justify={"center"}>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(skipToStart())}>
					<SkipBackIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(seekBackwards({ view }))}>
					<RewindIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(playButtonAction())}>
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(seekForwards({ view }))}>
					<FastForwardIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(skipToEnd())}>
					<SkipForwardIcon />
				</Button>
			</Column>
			<Column gap={4} justify={"flex-end"}>
				<CurrentTime />
				<CurrentBeat />
			</Column>
		</HStack>
	);
};

const Column = styled(HStack, {
	base: {
		flex: 1,
	},
});

export default EditorNavigationControls;
