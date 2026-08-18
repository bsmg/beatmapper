import { useListCollection } from "@ark-ui/react/collection";
import { useParams } from "@tanstack/react-router";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";

import { NavigationPanel } from "$/components/app/layouts";
import { Button, Select, Stat } from "$/components/ui/compositions";
import { SNAPPING_INCREMENTS } from "$/constants";
import { formatCursorPosition, formatCursorPositionInBeats } from "$/helpers/audio.helpers";
import { jumpBackwards, jumpForwards, jumpToEnd, jumpToStart, togglePlayback, updateSnap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectCursorPositionInBeats, selectLoading, selectPlaying, selectSnap } from "$/store/selectors";
import { getMetaKeyLabel, roundToNearest } from "$/utils";

function EditorNavigationControls() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

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

	const { collection: SNAPPING_INCREMENT_LIST_COLLECTION } = useListCollection({
		initialItems: SNAPPING_INCREMENTS.map((x) => ({ ...x, value: x.value.toString() })),
		itemToValue: (item) => item.value,
		itemToString: (item) => (item.shortcutKey ? `${item.label} (${getMetaKeyLabel()}+${item.shortcutKey})` : item.label),
	});

	return (
		<NavigationPanel.Section>
			<NavigationPanel.Column>
				<Select label="Snap to" unfocusOnPress collection={SNAPPING_INCREMENT_LIST_COLLECTION} value={[snapTo.toString()]} onValueChange={(ev) => dispatch(updateSnap(Number.parseFloat(ev.value[0])))} />
			</NavigationPanel.Column>
			<NavigationPanel.Column>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(jumpToStart())}>
					<SkipBackIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(jumpBackwards())}>
					<RewindIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(togglePlayback())}>
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(jumpForwards())}>
					<FastForwardIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={isLoadingSong} unfocusOnPress onClick={() => dispatch(jumpToEnd())}>
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
