import { type ComponentProps, forwardRef, useCallback } from "react";
import type WaveformData from "waveform-data";

import { Canvas } from "$/components/ui/atoms";
import { getScaledCanvasProps } from "$/helpers/canvas.helpers";

function getY(totalHeight: number, val: number) {
	const amplitude = 256;
	return totalHeight - ((val + 128) * totalHeight) / amplitude;
}

interface Props extends Omit<ComponentProps<typeof Canvas>, "dimensions" | "draw"> {
	width: number;
	height: number;
	waveformData: WaveformData | null;
	duration: number | null;
}
export const Waveform = forwardRef<HTMLCanvasElement, Props>(({ width, height, waveformData, duration, ...rest }: Props, ref) => {
	const { style, ...dimensions } = getScaledCanvasProps(width, height);

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

	return <Canvas {...rest} ref={ref} dimensions={dimensions} draw={drawWaveform} style={style} />;
});
