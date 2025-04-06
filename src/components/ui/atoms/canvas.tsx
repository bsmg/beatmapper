import { type ComponentProps, memo, useEffect, useRef } from "react";

interface Props extends ComponentProps<"canvas"> {
	dimensions: { width: number; height: number };
	draw: (ctx: CanvasRenderingContext2D, dimensions: { width: number; height: number }) => void;
}
export const Canvas = memo(function Canvas({ draw, dimensions, ...rest }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			const dpr = window.devicePixelRatio ?? 1;

			canvas.width = dimensions.width * dpr;
			canvas.height = dimensions.height * dpr;
			canvas.style.width = `${dimensions.width}px`;
			canvas.style.height = `${dimensions.height}px`;

			if (!ctx || dimensions.width === 0 || dimensions.height === 0) return;
			ctx.scale(dpr, dpr);
			draw(ctx, dimensions);
		}
	}, [dimensions, draw]);

	return <canvas ref={canvasRef} {...rest} />;
});
