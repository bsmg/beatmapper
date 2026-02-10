import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

export function useParentDimensions<T extends Element>(): [ref: RefObject<T>, dimensions: { width: number; height: number }] {
	const ref = useRef<T>(null);

	const [dimensions, setDimensions] = useState<{ width: number | null; height: number | null }>({ width: null, height: null });

	const updateDimensions = useCallback(() => {
		if (ref.current?.parentElement) {
			const { width, height } = ref.current.parentElement.getBoundingClientRect();
			setDimensions({ width, height });
		}
	}, []);

	useEffect(() => {
		updateDimensions(); // Initial dimensions on mount

		const handleResize = () => {
			updateDimensions();
		};

		window.addEventListener("resize", handleResize);

		// Use ResizeObserver for parent element resize detection
		const resizeObserver = new ResizeObserver(() => {
			updateDimensions();
		});

		if (ref.current?.parentElement) {
			resizeObserver.observe(ref.current.parentElement);
		}

		return () => {
			window.removeEventListener("resize", handleResize);
			if (ref.current?.parentElement) {
				resizeObserver.disconnect();
			}
		};
	}, [updateDimensions]);

	return [ref, dimensions as { width: number; height: number }];
}
