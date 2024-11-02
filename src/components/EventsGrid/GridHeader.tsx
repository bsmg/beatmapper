import { useRef, useState } from "react";
import styled from "styled-components";

import { COLORS } from "$/constants";
import { scrubEventsHeader } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";

interface Props {
	height: number;
	beatNums: number[];
	selectedBeat: number | null;
}

const GridHeader = ({ height, beatNums, selectedBeat }: Props) => {
	const dispatch = useAppDispatch();

	const [isScrubbing, setIsScrubbing] = useState(false);
	const lastActionDispatchedFor = useRef<number | null>(null);

	return (
		<Header
			style={{ height }}
			onPointerDown={() => {
				setIsScrubbing(true);
				if (selectedBeat !== null) dispatch(scrubEventsHeader({ selectedBeat }));
				lastActionDispatchedFor.current = selectedBeat;
			}}
			onPointerUp={() => {
				setIsScrubbing(false);
				lastActionDispatchedFor.current = null;
			}}
			onPointerMove={() => {
				if (!isScrubbing) {
					return;
				}

				// If this is our very first scrub of this pointer-down, we should use it by default.
				const shouldDispatchAction = lastActionDispatchedFor.current !== selectedBeat;

				if (shouldDispatchAction) {
					if (selectedBeat !== null) dispatch(scrubEventsHeader({ selectedBeat }));
					lastActionDispatchedFor.current = selectedBeat;
				}
			}}
		>
			{beatNums.map((num) => (
				<HeaderCell key={num}>
					<BeatNums>{num}</BeatNums>
				</HeaderCell>
			))}
		</Header>
	);
};

const Header = styled.div`
  display: flex;
  border-bottom: 1px solid ${COLORS.blueGray[500]};
  cursor: col-resize;
`;

const HeaderCell = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
`;

const BeatNums = styled.span`
  display: inline-block;
  transform: translateX(-50%);
  padding-bottom: 8px;

  ${HeaderCell}:first-of-type & {
    display: none;
  }
`;

export default GridHeader;
