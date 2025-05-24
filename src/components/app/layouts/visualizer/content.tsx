import { throttle } from "@tanstack/react-pacer";
import { type MouseEvent, type MouseEventHandler, type ReactNode, type RefObject, useCallback, useMemo, useRef, useState } from "react";

import { styled } from "$:styled-system/jsx";
import { useAppSelector } from "$/store/hooks";
import { selectPacerWait } from "$/store/selectors";

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: correct use case
	const throttledHandler = useCallback(
		throttle(
			(event) => {
				if (!scrubbing || !duration) return;

				const newCursorPosition = getNewCursorPosition(event, canvasRef, duration);

				if (onVisualizerClick) onVisualizerClick(event, newCursorPosition);
			},
			{ wait: wait },
		),
		[duration, onVisualizerClick, scrubbing],
	);

	const handleMouseMove: MouseEventHandler = (ev) => {
		ev.persist();
		throttledHandler(ev);
	};

	const handleMouseDown: MouseEventHandler = () => {
		setScrubbing(true);

		window.addEventListener("mouseup", () => {
			setScrubbing(false);
		});
	};

	const progressStyles = useMemo(() => {
		const ratioPlayed = duration ? cursorPosition / duration : 0;
		return { transform: `scaleX(${1 - ratioPlayed})` };
	}, [cursorPosition, duration]);

	return (
		<Wrapper onClick={handleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
			{children(canvasRef)}
			<ProgressRect style={progressStyles} />
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		cursor: "pointer",
	},
});

const ProgressRect = styled("div", {
	base: {
		position: "absolute",
		zIndex: 2,
		inset: 0,
		backgroundColor: "bg.translucent",
		mixBlendMode: "darken",
		transformOrigin: "center right",
		pointerEvents: "none",
	},
});

export default AudioVisualizerContent;
