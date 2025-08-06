import { debounce } from "@tanstack/pacer/debouncer";
import { type DependencyList, type RefObject, useEffect, useState } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectPacerWait } from "$/store/selectors";

export function useBoundingBox<T extends HTMLElement>(ref: RefObject<T | null>, dependencies: DependencyList = []) {
	const wait = useAppSelector(selectPacerWait);
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
			{ wait: wait },
		);

		window.addEventListener("scroll", recalculate);
		window.addEventListener("resize", recalculate);

		return () => {
			window.removeEventListener("scroll", recalculate);
			window.removeEventListener("resize", recalculate);
		};
	}, [ref, wait]);

	return [ref as RefObject<T>, boundingBox] as const;
}
