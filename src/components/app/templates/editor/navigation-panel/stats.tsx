import { getFormattedBeatNum, getFormattedTimestamp } from "$/helpers/audio.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectCursorPositionInBeats, selectPlaying } from "$/store/selectors";
import type { SongId } from "$/types";
import { roundToNearest } from "$/utils";

import { Stat } from "$/components/ui/compositions";

export function EditorTimeStat() {
	const displayString = useAppSelector((state) => {
		const cursorPosition = selectCursorPosition(state);
		return getFormattedTimestamp(cursorPosition);
	});
	return <Stat label="Time">{displayString}</Stat>;
}

interface Props {
	sid: SongId;
}
export function EditorBeatStat({ sid }: Props) {
	const displayString = useAppSelector((state) => {
		const isPlaying = selectPlaying(state);

		let displayString = "--";
		const cursorPositionInBeats = selectCursorPositionInBeats(state, sid);
		if (cursorPositionInBeats === null) return displayString;

		// When the song is playing, this number will move incredibly quickly. It's a hot blurry mess.
		// Instead of trying to debounce rendering, let's just round the value aggressively
		const roundedCursorPosition = isPlaying ? roundToNearest(cursorPositionInBeats, 0.5) : cursorPositionInBeats;

		displayString = getFormattedBeatNum(roundedCursorPosition);

		return displayString;
	});
	return <Stat label="Beat">{displayString}</Stat>;
}

export default EditorBeatStat;
