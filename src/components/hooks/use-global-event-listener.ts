import { useEffect, useRef } from "react";

interface UseGlobalEventListenerOptions {
	shouldFire?: boolean;
}

export function useGlobalEventListener<K extends keyof WindowEventMap>(key: K, listener: (this: Window, ev: WindowEventMap[K]) => void, options: UseGlobalEventListenerOptions = { shouldFire: true }) {
	const savedCallback = useRef(listener);

	useEffect(() => {
		if (options?.shouldFire) {
			window.addEventListener(key, listener);
		}

		savedCallback.current = listener;

		return () => {
			window.removeEventListener(key, listener);
		};
	}, [options?.shouldFire, key, listener]);
}
