import { useCallback, useMemo, useRef, useState } from "react";

import { For } from "$/components/ui/atoms";
import { normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";
import { flex } from "$:styled-system/patterns";
import { useEventGridContext } from "./context";

interface Props {
	onScrubHeader?: (details: { beat: number }) => void;
}
function EventGridTimeline({ onScrubHeader }: Props) {
	const { pointer: selectedBeat, startBeat, endBeat, snapTo } = useEventGridContext();

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

	const cells = useMemo(() => {
		const cells: { key: string; left: number; width: number; beatNumber: number | null }[] = [];
		const firstCell = Math.ceil(startBeat / snapTo) * snapTo;

		for (let b = firstCell; b < endBeat; b += snapTo) {
			const nextB = b + snapTo;
			const left = normalize(b, startBeat, endBeat, 0, 100);
			const right = normalize(nextB, startBeat, endBeat, 0, 100);
			const width = right - left;

			const remainder = Math.abs(b % 1);
			const isPrimary = remainder < 0.001 || Math.abs(remainder - 1) < 0.001;
			const beatNumber = isPrimary ? Math.round(b) : null;

			cells.push({ key: b.toFixed(4), left, width, beatNumber });
		}
		return cells;
	}, [startBeat, endBeat, snapTo]);

	return (
		<Header onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={handlePointerMove}>
			<For each={cells}>
				{({ key, left, width, beatNumber }) => (
					<HeaderCell key={key} style={{ left: `${left}%`, width: `${width}%` }}>
						{beatNumber !== null && <BeatNums>{beatNumber}</BeatNums>}
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
		height: "32px",
		display: "flex",
		cursor: "col-resize",
	},
});

const HeaderCell = styled("div", {
	base: flex.raw({
		position: "absolute",
		inset: 0,
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
