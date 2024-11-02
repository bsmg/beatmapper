import styled from "styled-components";

import { COLORS } from "$/constants";
import { useAppSelector } from "$/store/hooks";
import { getCursorPositionInBeats } from "$/store/selectors";
import { normalize } from "$/utils";

interface Props {
	gridWidth: number;
	startBeat: number;
	endBeat: number;
	zIndex: number;
}

const CursorPositionIndicator = ({ gridWidth, startBeat, endBeat, zIndex }: Props) => {
	const cursorPositionInBeats = useAppSelector(getCursorPositionInBeats);
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

const Elem = styled.div`
  position: absolute;
  top: 0;
  left: -1.5px;
  width: 3px;
  height: 100%;
  background: ${COLORS.yellow[500]};
  border-radius: 4px;
  pointer-events: none;
`;

export default CursorPositionIndicator;
