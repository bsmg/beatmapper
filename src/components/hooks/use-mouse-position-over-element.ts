import { type DependencyList, type RefObject, useState } from "react";

import { clamp } from "$/utils";
import { type UseElementRectOptions, useElementRect } from "./use-element-rect";
import { useGlobalEventListener } from "./use-global-event-listener";

interface Context {
	x: number;
	y: number;
	isWithinRect: boolean;
}

export interface UseMousePositionOverElementOptions extends UseElementRectOptions {
	onMouseMove?: (event: MouseEvent, ctx: Context) => void;
}
export function useMousePositionOverElement<T extends Element>(options: UseMousePositionOverElementOptions, deps: DependencyList = []): [ref: RefObject<T | null>, ctx: Context] {
	const [ref, rect] = useElementRect<T>(options, deps);

	const [context, setContext] = useState<Context>({ x: 0, y: 0, isWithinRect: false });

	useGlobalEventListener("mousemove", (event: MouseEvent) => {
		if (!rect || !ref.current) return;

		const isWithinX = event.pageX > rect.left && event.pageX < rect.right;
		const isWithinY = event.pageY > rect.top && event.pageY < rect.bottom;

		setContext({
			x: clamp(event.pageX - rect.left, 0, rect.width) + ref.current.scrollLeft,
			y: clamp(event.pageY - rect.top, 0, rect.height) + ref.current.scrollTop,
			isWithinRect: isWithinX && isWithinY,
		});

		if (options.onMouseMove) options.onMouseMove(event, context);
	});

	return [ref, context];
}
