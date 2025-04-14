import { debounce } from "@tanstack/react-pacer";
import { type DependencyList, type RefObject, useEffect, useState } from "react";

export function useBoundingBox<T extends HTMLElement>(ref: RefObject<T | null>, dependencies: DependencyList = []) {
	// We're using `useRef` for our boundingBox just as an instance variable.
	// Some bit of mutable state that doesn't require re-renders.
	const [boundingBox, setBoundingBox] = useState<DOMRect | null>(null);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		setBoundingBox(ref.current.getBoundingClientRect());
	}, [ref, ...dependencies]);

	// We want to re-capture the bounding box whenever the user scrolls or resizes the window.
	useEffect(() => {
		if (!ref.current) {
			return;
		}

		const recalculate = debounce(
			() => {
				if (ref.current) {
					setBoundingBox(ref.current.getBoundingClientRect());
				}
			},
			{ wait: 250 },
		);

		window.addEventListener("scroll", recalculate);
		window.addEventListener("resize", recalculate);

		return () => {
			window.removeEventListener("scroll", recalculate);
			window.removeEventListener("resize", recalculate);
		};
	}, [ref]);

	return [ref as RefObject<T>, boundingBox] as const;
}
