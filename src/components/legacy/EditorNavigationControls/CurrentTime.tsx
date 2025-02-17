import { getFormattedTimestamp } from "$/helpers/audio.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectCursorPosition } from "$/store/selectors";

import LabeledNumber from "../LabeledNumber";

const CurrentTime = () => {
	const displayString = useAppSelector((state) => {
		const cursorPosition = selectCursorPosition(state);
		return getFormattedTimestamp(cursorPosition);
	});
	return <LabeledNumber label="Time">{displayString}</LabeledNumber>;
};

export default CurrentTime;
