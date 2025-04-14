import { type ComponentProps, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

interface Props extends ComponentProps<"canvas"> {
	dimensions: { width: number; height: number };
	draw: (ctx: CanvasRenderingContext2D, dimensions: { width: number; height: number }) => void;
}
export const Canvas = forwardRef<HTMLCanvasElement, Props>(function Canvas({ draw, dimensions, ...rest }, ref) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

	const styles = useMemo(() => ({ ...rest.style, width: dimensions.width, height: dimensions.height }), [rest.style, dimensions]);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			const dpr = window.devicePixelRatio ?? 1;

			canvas.width = dimensions.width * dpr;
			canvas.height = dimensions.height * dpr;
			canvas.style.width = `${dimensions.width * (1 / dpr)}px`;
			canvas.style.height = `${dimensions.height / dpr}px`;

			if (!ctx || dimensions.width === 0 || dimensions.height === 0) return;
			ctx.scale(dpr, dpr);
			draw(ctx, dimensions);
		}
	}, [dimensions, draw]);

	return <canvas ref={canvasRef} {...rest} style={styles} />;
});
