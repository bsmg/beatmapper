import { useCallback, useRef, useState } from "react";

import { scrubEventsHeader } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectEventEditorSelectedBeat } from "$/store/selectors";

import { styled } from "$:styled-system/jsx";
import { flex } from "$:styled-system/patterns";

interface Props {
	beatNums: number[];
}
function EventGridTimeline({ beatNums }: Props) {
	const dispatch = useAppDispatch();
	const selectedBeat = useAppSelector(selectEventEditorSelectedBeat);

	const [isScrubbing, setIsScrubbing] = useState(false);
	const lastActionDispatchedFor = useRef<number | null>(null);

	const handlePointerDown = useCallback(() => {
		setIsScrubbing(true);
		if (selectedBeat !== null) dispatch(scrubEventsHeader({ selectedBeat }));
		lastActionDispatchedFor.current = selectedBeat;
	}, [dispatch, selectedBeat]);

	const handlePointerUp = useCallback(() => {
		setIsScrubbing(false);
		lastActionDispatchedFor.current = null;
	}, []);

	const handlePointerMove = useCallback(() => {
		if (!isScrubbing) return;

		// If this is our very first scrub of this pointer-down, we should use it by default.
		const shouldDispatchAction = lastActionDispatchedFor.current !== selectedBeat;

		if (shouldDispatchAction) {
			if (selectedBeat !== null) dispatch(scrubEventsHeader({ selectedBeat }));
			lastActionDispatchedFor.current = selectedBeat;
		}
	}, [dispatch, selectedBeat, isScrubbing]);

	return (
		<Header onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={handlePointerMove}>
			{beatNums.map((num) => (
				<HeaderCell key={num}>
					<BeatNums>{num}</BeatNums>
				</HeaderCell>
			))}
		</Header>
	);
}

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

export default EventGridTimeline;
