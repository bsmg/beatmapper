import { useRef, useState } from "react";

import { scrubEventsHeader } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";

import { styled } from "$:styled-system/jsx";
import { flex } from "$:styled-system/patterns";

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

const Header = styled("div", {
	base: {
		display: "flex",
		borderBottomWidth: "sm",
		borderColor: "border.muted",
		cursor: "col-resize",
	},
});

const HeaderCell = styled("div", {
	base: flex.raw({
		align: "flex-end",
		flex: 1,
	}),
});

const BeatNums = styled("span", {
	base: {
		display: "inline-block",
		transform: "translateX(-50%)",
		paddingBlock: 1,
	},
});

export default GridHeader;
