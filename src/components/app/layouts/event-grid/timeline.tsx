import { useCallback, useRef, useState } from "react";

import { For } from "$/components/ui/atoms";
import { styled } from "$:styled-system/jsx";
import { flex } from "$:styled-system/patterns";
import { useEventGridContext } from "./context";

interface Props {
	onScrubHeader?: (details: { beat: number }) => void;
}
function EventGridTimeline({ onScrubHeader }: Props) {
	const { pointer: selectedBeat, beatNums } = useEventGridContext();

	const [isScrubbing, setIsScrubbing] = useState(false);
	const lastActionDispatchedFor = useRef<number | null>(null);

	const handlePointerDown = useCallback(() => {
		setIsScrubbing(true);
		if (onScrubHeader) onScrubHeader({ beat: selectedBeat });
		lastActionDispatchedFor.current = selectedBeat;
	}, [onScrubHeader, selectedBeat]);

	const handlePointerUp = useCallback(() => {
		setIsScrubbing(false);
		lastActionDispatchedFor.current = null;
	}, []);

	const handlePointerMove = useCallback(() => {
		if (!isScrubbing) return;

		// If this is our very first scrub of this pointer-down, we should use it by default.
		const shouldDispatchAction = lastActionDispatchedFor.current !== selectedBeat;

		if (shouldDispatchAction) {
			if (onScrubHeader) onScrubHeader({ beat: selectedBeat });
			lastActionDispatchedFor.current = selectedBeat;
		}
	}, [onScrubHeader, selectedBeat, isScrubbing]);

	return (
		<Header onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={handlePointerMove}>
			<For each={beatNums}>
				{(num) => (
					<HeaderCell key={num}>
						<BeatNums>{num}</BeatNums>
					</HeaderCell>
				)}
			</For>
		</Header>
	);
}

const Header = styled("div", {
	base: {
		position: "relative",
		width: "100%",
		display: "flex",
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
