import { useEffect, useRef } from "react";

interface UseGlobalEventListenerOptions {
	shouldFire?: boolean;
	options?: AddEventListenerOptions;
}

export function useGlobalEventListener<K extends keyof WindowEventMap>(key: K, listener: (this: Window, ev: WindowEventMap[K]) => void, options: UseGlobalEventListenerOptions = { shouldFire: true }) {
	const savedCallback = useRef(listener);

	useEffect(() => {
		const shouldFire = options?.shouldFire ?? true;

		if (shouldFire) {
			window.addEventListener(key, listener, options.options);
		}

		savedCallback.current = listener;

		return () => {
			window.removeEventListener(key, listener);
		};
	}, [key, listener, options.shouldFire, options.options]);
}
