import { type DependencyList, type RefObject, useEffect } from "react";

import { clamp } from "$/utils";
import { useBoundingBox } from "./use-bounding-box";

interface Options {
	boxDependencies: DependencyList;
	onlyTriggerInside: boolean;
}

export function useMousePositionOverElement<T extends HTMLElement>(container: RefObject<T | null>, callback: (ref: T, x: number, y: number, event: MouseEvent) => void, options: Partial<Options> = {}) {
	const [ref, bb] = useBoundingBox<T>(container, options.boxDependencies);

	useEffect(() => {
		function handleMouseMove(ev: MouseEvent) {
			if (!bb) return;
			// Check if the cursor is inside the box
			const insideX = ev.pageX > bb.left && ev.pageX < bb.right;
			const insideY = ev.pageY > bb.top && ev.pageY < bb.bottom;

			const x = clamp(ev.pageX - bb.left, 0, bb.width);
			const y = clamp(ev.pageY - bb.top, 0, bb.height);

			const shouldCall = options.onlyTriggerInside ? insideX && insideY : true;

			if (ref.current && shouldCall) {
				callback(ref.current, x, y, ev);
			}
		}

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [bb, ref.current, callback, options.onlyTriggerInside]);

	return ref;
}
