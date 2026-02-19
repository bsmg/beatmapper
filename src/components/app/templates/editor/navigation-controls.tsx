import { useParams, useRouteContext } from "@tanstack/react-router";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";

import { SNAPPING_INCREMENT_LIST_COLLECTION } from "$/components/app/constants";
import { NavigationPanel } from "$/components/app/layouts";
import { Button, Select, Stat } from "$/components/ui/compositions";
import { formatCursorPosition, formatCursorPositionInBeats } from "$/helpers/audio.helpers";
import { jumpToEnd, jumpToStart, seekBackwards, seekForwards, togglePlaying, updateSnap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectCursorPositionInBeats, selectLoading, selectPlaying, selectSnap } from "$/store/selectors";
import { roundToNearest } from "$/utils";

function EditorNavigationControls() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isPlaying = useAppSelector(selectPlaying);
	const isLoadingSong = useAppSelector(selectLoading);
	const snapTo = useAppSelector(selectSnap);

	const timeDisplayText = useAppSelector((state) => {
		const cursorPosition = selectCursorPosition(state);

		return formatCursorPosition(cursorPosition);
	});
	const beatDisplayText = useAppSelector((state) => {
		const cursorPositionInBeats = selectCursorPositionInBeats(state, sid);

		if (cursorPositionInBeats === null) return "--";

		// When the song is playing, this number will move incredibly quickly. It's a hot blurry mess.
		// Instead of trying to debounce rendering, let's just round the value aggressively
		const roundedCursorPosition = isPlaying ? roundToNearest(cursorPositionInBeats, 0.5) : cursorPositionInBeats;

		return formatCursorPositionInBeats(roundedCursorPosition);
	});

	return (
		<NavigationPanel.Section>
			<NavigationPanel.Column>
				<Select label="Snap to" unfocusOnPress collection={SNAPPING_INCREMENT_LIST_COLLECTION} value={[snapTo.toString()]} onValueChange={(ev) => dispatch(updateSnap({ value: Number.parseFloat(ev.value[0]) }))} />
			</NavigationPanel.Column>
			<NavigationPanel.Column>
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
			</NavigationPanel.Column>
			<NavigationPanel.Column>
				<Stat label="Time">{timeDisplayText}</Stat>
				<Stat label="Beat">{beatDisplayText}</Stat>
			</NavigationPanel.Column>
		</NavigationPanel.Section>
	);
}

export default EditorNavigationControls;
