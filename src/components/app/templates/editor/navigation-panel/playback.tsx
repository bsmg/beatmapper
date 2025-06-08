import { createListCollection } from "@ark-ui/react";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";

import { SNAPPING_INCREMENTS } from "$/constants";
import { jumpToEnd, jumpToStart, pausePlayback, seekBackwards, seekForwards, startPlayback, updateSnap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading, selectPlaying, selectSnap } from "$/store/selectors";
import type { SongId } from "$/types";

import { styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { useViewFromLocation } from "$/components/app/hooks";
import { Button, Select } from "$/components/ui/compositions";
import { EditorBeatStat, EditorTimeStat } from "./stats";

const SNAPPING_INCREMENT_LIST_COLLECTION = createListCollection({
	items: SNAPPING_INCREMENTS.map((item) => {
		const label = item.shortcutKey ? `${item.label} (${item.shortcutLabel})` : item.label;
		return { value: item.value.toString(), label };
	}),
});

interface Props {
	sid: SongId;
}
function EditorNavigationControls({ sid }: Props) {
	const dispatch = useAppDispatch();
	const view = useViewFromLocation();
	const isPlaying = useAppSelector(selectPlaying);
	const isLoadingSong = useAppSelector(selectLoading);
	const snapTo = useAppSelector(selectSnap);

	const playButtonAction = isPlaying ? pausePlayback : startPlayback;

	return (
		<Wrapper>
			<Column>
				<Select collection={SNAPPING_INCREMENT_LIST_COLLECTION} value={[snapTo.toString()]} onValueChange={(ev) => dispatch(updateSnap({ value: Number(ev.value[0]) }))}>
					Snap To
				</Select>
			</Column>
			<Column>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(jumpToStart({ songId: sid }))}>
					<SkipBackIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(seekBackwards({ songId: sid, view }))}>
					<RewindIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(playButtonAction({ songId: sid }))}>
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(seekForwards({ songId: sid, view }))}>
					<FastForwardIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} onClick={() => dispatch(jumpToEnd({ songId: sid }))}>
					<SkipForwardIcon />
				</Button>
			</Column>
			<Column>
				<EditorTimeStat />
				<EditorBeatStat sid={sid} />
			</Column>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: hstack.raw({
		gap: 4,
		justify: "space-between",
		overflowX: "auto",
		_scrollbar: { display: "none" },
	}),
});

const Column = styled("div", {
	base: hstack.raw({
		justify: { base: "center", _first: "flex-start", _last: "flex-end" },
		flex: 1,
		gap: { base: 1, _first: 4, _last: 4 },
	}),
});

export default EditorNavigationControls;
