import { useEffect } from "react";

import { throttle } from "$/utils";

/**
 * A hook that handles scrolling on a specified element WITHOUT scrolling the
 * page. Needs to be in a hook since you can't call ev.preventDefault() on
 * standard `onWheel` events.
 *
 * Use sparingly.
 */
export function useMousewheel(handleMouseWheel: (event: WheelEvent) => void) {
	useEffect(() => {
		const throttledHandler = throttle(handleMouseWheel, 100);

		function wrappedHandler(ev: WheelEvent) {
			ev.preventDefault();

			throttledHandler(ev);
		}

		window.addEventListener("wheel", wrappedHandler, { passive: false });

		return () => window.removeEventListener("wheel", wrappedHandler);
	}, [handleMouseWheel]);
}
