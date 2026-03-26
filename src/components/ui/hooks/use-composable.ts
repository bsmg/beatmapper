import type { ReactNode } from "react";
import { useCallback } from "react";

export type ComposableFn<TParams extends unknown[]> = ReactNode | ((...params: TParams) => ReactNode);

export function useComposable<TParams extends unknown[]>(render: ComposableFn<TParams>, fallback?: (...params: TParams) => ReactNode) {
	return useCallback(
		(...params: TParams) => {
			let content: ReactNode;

			if (typeof render === "function") {
				content = render(...params);
			} else if (render !== undefined) {
				content = render;
			} else {
				content = typeof fallback === "function" ? fallback(...params) : fallback;
			}

			return content;
		},
		[render, fallback],
	);
}
