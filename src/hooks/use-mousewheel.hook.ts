import { useEffect } from "react";

/**
 * A hook that handles scrolling on a specified element WITHOUT scrolling the
 * page. Needs to be in a hook since you can't call ev.preventDefault() on
 * standard `onWheel` events.
 *
 * Use sparingly.
 */
export function useMousewheel(handleMouseWheel: (event: WheelEvent) => void) {
	useEffect(() => {
		function wrappedHandler(ev: WheelEvent) {
			ev.preventDefault();

			handleMouseWheel(ev);
		}

		window.addEventListener("wheel", wrappedHandler, { passive: false });

		return () => window.removeEventListener("wheel", wrappedHandler);
	}, [handleMouseWheel]);
}
