import { useCallback, useEffect, useRef, useState } from "react";

interface Dimensions {
	width: number | null;
	height: number | null;
}
export function useParentDimensions<T extends HTMLElement>(): [{ width: number; height: number }, React.RefObject<T>] {
	const [dimensions, setDimensions] = useState<Dimensions>({ width: null, height: null });
	const ref = useRef<T>(null);

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

	return [dimensions as { width: number; height: number }, ref];
}
