import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCursorPositionInBeats } from "$/store/selectors";
import { normalize } from "$/utils";

import { styled } from "$:styled-system/jsx";

interface Props {
	gridWidth: number;
	startBeat: number;
	endBeat: number;
	zIndex: number;
}

const CursorPositionIndicator = ({ gridWidth, startBeat, endBeat, zIndex }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, songId));
	if (cursorPositionInBeats === null) return;

	const cursorOffsetInWindow = normalize(cursorPositionInBeats, startBeat, endBeat, 0, gridWidth);

	return (
		<Elem
			style={{
				transform: `translateX(${cursorOffsetInWindow}px)`,
				zIndex,
			}}
		/>
	);
};

const Elem = styled("div", {
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
	},
});

export default CursorPositionIndicator;
