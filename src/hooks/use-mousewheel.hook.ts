/**
 * A hook that handles scrolling on a specified element WITHOUT scrolling the
 * page. Needs to be in a hook since you can't call ev.preventDefault() on
 * standard `onWheel` events.
 *
 * Use sparingly.
 */

import { useEffect } from "react";

import { throttle } from "$/utils";

export function useMousewheel(handleMouseWheel: (event: MouseEvent) => void) {
	useEffect(() => {
		const throttledHandler = throttle(handleMouseWheel, 100);

		function wrappedHandler(ev: MouseEvent) {
			ev.preventDefault();

			throttledHandler(ev);
		}

		window.addEventListener("wheel", wrappedHandler, { passive: false });

		return () => window.removeEventListener("wheel", wrappedHandler);
	}, [handleMouseWheel]);
}