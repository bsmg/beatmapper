import { getFormattedBeatNum } from "$/helpers/audio.helpers";
import { useAppSelector } from "$/store/hooks";
import { getCursorPositionInBeats, getIsPlaying, getSelectedSong } from "$/store/selectors";
import { roundToNearest } from "$/utils";

import LabeledNumber from "../LabeledNumber";

const CurrentBeat = () => {
	const displayString = useAppSelector((state) => {
		const song = getSelectedSong(state);
		const isPlaying = getIsPlaying(state);

		let displayString = "--";
		if (song) {
			const cursorPositionInBeats = getCursorPositionInBeats(state);
			if (cursorPositionInBeats === null) return displayString;

			// When the song is playing, this number will move incredibly quickly. It's a hot blurry mess.
			// Instead of trying to debounce rendering, let's just round the value aggressively
			const roundedCursorPosition = isPlaying ? roundToNearest(cursorPositionInBeats, 0.5) : cursorPositionInBeats;

			displayString = getFormattedBeatNum(roundedCursorPosition);
		}
		return displayString;
	});
	return <LabeledNumber label="Beat">{displayString}</LabeledNumber>;
};

export default CurrentBeat;
