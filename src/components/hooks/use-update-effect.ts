import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";

export function useUpdateEffect(callback: EffectCallback, deps: DependencyList = []) {
	const callbackRef = useRef(callback);
	const isFirstRender = useRef(true);

	callbackRef.current = callback;

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		return callbackRef.current();
	}, [...deps]);
}
