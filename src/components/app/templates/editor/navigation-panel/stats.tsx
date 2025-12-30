import { useParams } from "@tanstack/react-router";

import { Stat } from "$/components/ui/compositions";
import { formatCursorPosition, formatCursorPositionInBeats } from "$/helpers/audio.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectCursorPositionInBeats, selectPlaying } from "$/store/selectors";
import { roundToNearest } from "$/utils";

export function EditorTimeStat() {
	const displayString = useAppSelector((state) => {
		const cursorPosition = selectCursorPosition(state);
		return formatCursorPosition(cursorPosition);
	});
	return <Stat label="Time">{displayString}</Stat>;
}

export function EditorBeatStat() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid" });

	const displayString = useAppSelector((state) => {
		const isPlaying = selectPlaying(state);

		let displayString = "--";
		const cursorPositionInBeats = selectCursorPositionInBeats(state, sid);
		if (cursorPositionInBeats === null) return displayString;

		// When the song is playing, this number will move incredibly quickly. It's a hot blurry mess.
		// Instead of trying to debounce rendering, let's just round the value aggressively
		const roundedCursorPosition = isPlaying ? roundToNearest(cursorPositionInBeats, 0.5) : cursorPositionInBeats;

		displayString = formatCursorPositionInBeats(roundedCursorPosition);

		return displayString;
	});
	return <Stat label="Beat">{displayString}</Stat>;
}

export default EditorBeatStat;
