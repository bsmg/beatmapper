import { type MouseEvent, type MouseEventHandler, type RefObject, memo, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import type WaveformData from "waveform-data";

import { getDevicePixelRatio, getScaledCanvasProps } from "$/helpers/canvas.helpers";
import { throttle } from "$/utils";

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
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
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
		throttle((ev) => {
			if (!scrubbing || !duration) {
				return;
			}

			const newCursorPosition = getNewCursorPosition(ev, canvasRef, duration);

			scrubWaveform(newCursorPosition);
		}, 30),
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

	useEffect(() => {
		if (!canvasRef.current || !waveformData) {
			return;
		}

		if (!contextRef.current) {
			contextRef.current = canvasRef.current.getContext("2d");
		}

		const ctx = contextRef.current;
		if (!ctx) return;

		const devicePixelRatio = getDevicePixelRatio();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(devicePixelRatio, devicePixelRatio);

		ctx.clearRect(0, 0, width, height);

		ctx.strokeStyle = "#FFF";

		ctx.beginPath();

		const resampledData = waveformData.resample({ width }).toJSON();

		resampledData.data.forEach((min, i) => {
			ctx.lineTo(i / 2, getY(height, min));
		});

		ctx.stroke();
	}, [width, height, waveformData]);

	if (!duration) return;
	const ratioPlayed = cursorPosition / duration;

	return (
		<Wrapper>
			<Canvas ref={canvasRef} onClick={handleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} style={style} {...dimensions} />
			<ProgressRect style={{ transform: `scaleX(${1 - ratioPlayed})` }} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
`;

const Canvas = styled.canvas`
  position: relative;
  z-index: 1;
  display: block;
`;

const ProgressRect = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  mix-blend-mode: darken;
  transform-origin: center right;
  pointer-events: none;
`;

export default memo(ScrubbableWaveform);
