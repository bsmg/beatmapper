import { type DebouncerOptions, debounce } from "@tanstack/react-pacer/debouncer";
import type { AnyFunction } from "@tanstack/react-pacer/types";
import { type DependencyList, type RefObject, useEffect, useRef, useState } from "react";

export interface UseElementRectOptions {
	debouncerOptions: DebouncerOptions<AnyFunction>;
}
export function useElementRect<T extends Element>({ debouncerOptions }: UseElementRectOptions, deps: DependencyList = []): [ref: RefObject<T | null>, rect: DOMRect | null] {
	const ref = useRef<T>(null);

	const [rect, setRect] = useState<DOMRect | null>(null);

	useEffect(() => {
		if (!ref.current || !window) {
			return;
		}

		const recalculate = debounce(() => {
			if (ref.current) {
				setRect(ref.current.getBoundingClientRect());
			}
		}, debouncerOptions);

		const observer = new window.ResizeObserver(recalculate);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [debouncerOptions, ...deps]);

	return [ref, rect];
}
