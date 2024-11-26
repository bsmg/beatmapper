import { getFormattedBeatNum } from "$/helpers/audio.helpers";
import { useAppSelector } from "$/store/hooks";
import { getCursorPositionInBeats, getIsPlaying, selectActiveSongId } from "$/store/selectors";
import { roundToNearest } from "$/utils";

import LabeledNumber from "../LabeledNumber";

const CurrentBeat = () => {
	const songId = useAppSelector(selectActiveSongId);
	const displayString = useAppSelector((state) => {
		const isPlaying = getIsPlaying(state);

		let displayString = "--";
		const cursorPositionInBeats = getCursorPositionInBeats(state, songId);
		if (cursorPositionInBeats === null) return displayString;

		// When the song is playing, this number will move incredibly quickly. It's a hot blurry mess.
		// Instead of trying to debounce rendering, let's just round the value aggressively
		const roundedCursorPosition = isPlaying ? roundToNearest(cursorPositionInBeats, 0.5) : cursorPositionInBeats;

		displayString = getFormattedBeatNum(roundedCursorPosition);

		return displayString;
	});
	return <LabeledNumber label="Beat">{displayString}</LabeledNumber>;
};

export default CurrentBeat;
