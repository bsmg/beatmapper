import { type DependencyList, useEffect } from "react";

export function useOnKeydown(key: string, callback: (ev: KeyboardEvent) => void, deps: DependencyList) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: valid use case
	useEffect(() => {
		const handleKeydown = (ev: KeyboardEvent) => {
			if (ev.code === key) {
				callback(ev);
			}
		};

		window.addEventListener("keydown", handleKeydown);

		return () => {
			window.removeEventListener("keydown", handleKeydown);
		};
	}, [key, callback, deps]);
}
