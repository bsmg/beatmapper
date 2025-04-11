import { throttle } from "@tanstack/react-pacer";
import { type MouseEvent, type MouseEventHandler, type RefObject, memo, useCallback, useRef, useState } from "react";
import type WaveformData from "waveform-data";

import { styled } from "$:styled-system/jsx";
import { Canvas } from "$/components/ui/atoms";
import { getScaledCanvasProps } from "$/helpers/canvas.helpers";

function getY(totalHeight: number, val: number) {
	const amplitude = 256;
	return totalHeight - ((val + 128) * totalHeight) / amplitude;
}

function getNewCursorPosition(ev: MouseEvent, ref: RefObject<HTMLElement | null>, duration: number) {
	if (!ref.current) return 0;
	const boundingBox = ref.current.getBoundingClientRect();

	// Our waveform will be N pixels from both sides of the screen.
	const xDistanceIntoCanvas = ev.pageX - boundingBox.left;
	const ratio = xDistanceIntoCanvas / boundingBox.width;

	return ratio * duration;
}

interface Props {
	width: number;
	height: number;
	waveformData: WaveformData | null;
	duration: number | null;
	cursorPosition: number;
	isEnabled?: boolean;
	scrubWaveform: (newOffset: number) => void;
}

export const ScrubbableWaveform = ({ width, height, waveformData, duration, cursorPosition, scrubWaveform }: Props) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { style, ...dimensions } = getScaledCanvasProps(width, height);

	const [scrubbing, setScrubbing] = useState(false);

	const handleClick = useCallback<MouseEventHandler>(
		(ev) => {
			if (!canvasRef.current || !duration) {
				return;
			}

			const newCursorPosition = getNewCursorPosition(ev, canvasRef, duration);

			scrubWaveform(newCursorPosition);
		},
		[duration, scrubWaveform],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: correct use case
	const throttledHandler = useCallback(
		throttle(
			(ev) => {
				if (!scrubbing || !duration) {
					return;
				}

				const newCursorPosition = getNewCursorPosition(ev, canvasRef, duration);

				scrubWaveform(newCursorPosition);
			},
			{ wait: 30 },
		),
		[duration, scrubWaveform, scrubbing],
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

	const drawWaveform = useCallback(
		(ctx: CanvasRenderingContext2D, { width, height }: { width: number; height: number }) => {
			if (!waveformData) return;
			ctx.clearRect(0, 0, width, height);

			ctx.strokeStyle = "#FFF";

			ctx.beginPath();

			const resampledData = waveformData.resample({ width }).toJSON();

			resampledData.data.forEach((min, i) => {
				ctx.lineTo(i / 2, getY(height, min));
			});

			ctx.stroke();
		},
		[waveformData],
	);

	if (!duration) return;
	const ratioPlayed = cursorPosition / duration;

	return (
		<div>
			<Canvas ref={canvasRef} dimensions={dimensions} draw={drawWaveform} onClick={handleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} style={style} />
			<ProgressRect style={{ transform: `scaleX(${1 - ratioPlayed})` }} />
		</div>
	);
};

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

export default memo(ScrubbableWaveform);
