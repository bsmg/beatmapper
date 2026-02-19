import { useThrottler } from "@tanstack/react-pacer/throttler";
import { type MouseEvent, type MouseEventHandler, type ReactNode, type RefObject, useCallback, useMemo, useRef, useState } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectPacerWait } from "$/store/selectors";
import { styled } from "$:styled-system/jsx";

function getNewCursorPosition(ev: MouseEvent, ref: RefObject<HTMLElement | null>, duration: number) {
	if (!ref.current) return 0;
	const boundingBox = ref.current.getBoundingClientRect();

	// Our waveform will be N pixels from both sides of the screen.
	const xDistanceIntoCanvas = ev.pageX - boundingBox.left;
	const ratio = xDistanceIntoCanvas / boundingBox.width;

	return ratio * duration;
}

interface Props {
	cursorPosition: number;
	duration: number | null;
	onVisualizerClick?: (event: MouseEvent<HTMLElement>, time: number) => void;
	children: (ref: RefObject<HTMLCanvasElement>) => ReactNode;
}
function AudioVisualizerContent({ cursorPosition, duration, onVisualizerClick, children }: Props) {
	const wait = useAppSelector(selectPacerWait);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [scrubbing, setScrubbing] = useState(false);

	const handleClick = useCallback<MouseEventHandler<HTMLElement>>(
		(event) => {
			if (!canvasRef.current || !duration) return;

			const newCursorPosition = getNewCursorPosition(event, canvasRef, duration);

			if (onVisualizerClick) onVisualizerClick(event, newCursorPosition);
		},
		[duration, onVisualizerClick],
	);

	const throttler = useThrottler<MouseEventHandler<HTMLElement>>(
		(event) => {
			if (!scrubbing || !duration) return;

			const newCursorPosition = getNewCursorPosition(event, canvasRef, duration);

			if (onVisualizerClick) onVisualizerClick(event, newCursorPosition);
		},
		{ wait: wait },
		() => ({ duration, scrubbing, onVisualizerClick }),
	);

	const handleMouseMove: MouseEventHandler<HTMLElement> = (ev) => {
		ev.persist();
		throttler.maybeExecute(ev);
	};

	const handleMouseDown: MouseEventHandler = () => {
		setScrubbing(true);

		window.addEventListener("mouseup", () => {
			setScrubbing(false);
		});
	};

	const progressStyles = useMemo(() => {
		const ratioPlayed = duration ? (cursorPosition / duration) * 100 : 0;
		return { clipPath: `inset(0 ${100 - ratioPlayed}% 0 0)` };
	}, [cursorPosition, duration]);

	return (
		<Wrapper onClick={handleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
			<Layer overlay={true}>{children(canvasRef)}</Layer>
			<Layer style={progressStyles}>{children(canvasRef)}</Layer>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		cursor: "pointer",
	},
});

const Layer = styled("div", {
	base: {
		position: "absolute",
		inset: 0,
	},
	variants: {
		overlay: {
			true: { opacity: 0.25 },
		},
	},
});

export default AudioVisualizerContent;
