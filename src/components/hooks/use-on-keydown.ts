import { type DependencyList, useCallback, useRef } from "react";

import { useGlobalEventListener } from "./use-global-event-listener";

export function useOnKeydown(key: string, callback: (ev: KeyboardEvent) => void, deps: DependencyList) {
	const callbackRef = useRef(callback);

	callbackRef.current = callback;

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			if (ev.code === key) {
				callbackRef.current(ev);
			}
		},
		[key, ...deps],
	);

	useGlobalEventListener("keydown", handleKeyDown);
}
