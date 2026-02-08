import { useParams, useRouteContext } from "@tanstack/react-router";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";

import { SNAPPING_INCREMENT_LIST_COLLECTION } from "$/components/app/constants";
import { Button, Select } from "$/components/ui/compositions";
import { jumpToEnd, jumpToStart, seekBackwards, seekForwards, togglePlaying, updateSnap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading, selectPlaying, selectSnap } from "$/store/selectors";
import { styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { EditorBeatStat, EditorTimeStat } from "./stats";

function EditorNavigationControls() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isPlaying = useAppSelector(selectPlaying);
	const isLoadingSong = useAppSelector(selectLoading);
	const snapTo = useAppSelector(selectSnap);

	return (
		<Wrapper>
			<Column>
				<Select label="Snap to" unfocusOnPress collection={SNAPPING_INCREMENT_LIST_COLLECTION} value={[snapTo.toString()]} onValueChange={(ev) => dispatch(updateSnap({ value: Number.parseFloat(ev.value[0]) }))} />
			</Column>
			<Column>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(jumpToStart({ songId: sid }))}>
					<SkipBackIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(seekBackwards({ songId: sid, view }))}>
					<RewindIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(togglePlaying({ songId: sid, view }))}>
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(seekForwards({ songId: sid, view }))}>
					<FastForwardIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(jumpToEnd({ songId: sid }))}>
					<SkipForwardIcon />
				</Button>
			</Column>
			<Column>
				<EditorTimeStat />
				<EditorBeatStat />
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
