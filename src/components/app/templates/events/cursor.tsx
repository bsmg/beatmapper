import { useCallback } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectCursorPositionInBeats, selectEventEditorStartAndEndBeat } from "$/store/selectors";
import type { SongId } from "$/types";
import { normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";

interface Props {
	sid: SongId;
	gridWidth: number;
}
function EventGridCursor({ sid, gridWidth }: Props) {
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));

	const createStyles = useCallback(
		(cursor: number) => {
			const cursorOffsetInWindow = normalize(cursor, startBeat, endBeat, 0, gridWidth);
			return {
				transform: `translateX(${cursorOffsetInWindow}px)`,
			};
		},
		[startBeat, endBeat, gridWidth],
	);

	if (cursorPositionInBeats === null) return;
	return <Element style={createStyles(cursorPositionInBeats)} />;
}

const Element = styled("div", {
	base: {
		width: "4px",
		position: "absolute",
		top: 0,
		left: "-2px",
		height: "100%",
		colorPalette: "yellow",
		backgroundColor: "colorPalette.500",
		borderRadius: "full",
		pointerEvents: "none",
		zIndex: 1,
	},
});

export default EventGridCursor;
