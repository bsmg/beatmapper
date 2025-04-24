import { type ComponentProps, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

function getScaledCanvasProps(width: number, height: number) {
	const devicePixelRatio = window.devicePixelRatio ?? 1;

	// HACK: We need to scale our canvas by our devicePixelRatio.
	// This is a 2-step process:
	//  - Change the width/height/style.width/style.height
	//  - Use the canvas context to scale it accordingly.
	// I normally do both of these things in the same place, but because we're using an offscreenCanvas, we don't have access to the canvas context here.
	// So I need to do that first step inline, and trust that the ctx.scale call will exist in `SlopesCanvas.worker`.
	return {
		style: {
			width,
			height,
		},
		width: width * devicePixelRatio,
		height: height * devicePixelRatio,
	};
}

interface Props extends ComponentProps<"canvas"> {
	width: number;
	height: number;
	draw: (ctx: CanvasRenderingContext2D, dimensions: { width: number; height: number }) => void;
}
export const Canvas = forwardRef<HTMLCanvasElement, Props>(function Canvas({ draw, width: initialWidth, height: initialHeight, ...rest }, ref) {
	const { style, width, height } = useMemo(() => getScaledCanvasProps(initialWidth, initialHeight), [initialWidth, initialHeight]);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

	const styles = useMemo(() => ({ ...rest.style, ...style, width: width, height: height }), [rest.style, style, width, height]);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			const dpr = window.devicePixelRatio ?? 1;

			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width * (1 / dpr)}px`;
			canvas.style.height = `${height / dpr}px`;

			if (!ctx || width === 0 || height === 0) return;
			ctx.scale(dpr, dpr);
			draw(ctx, { width, height });
		}
	}, [width, height, draw]);

	return <canvas ref={canvasRef} {...rest} style={styles} />;
});
