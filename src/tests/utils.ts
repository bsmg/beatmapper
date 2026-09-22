/** biome-ignore-all lint/suspicious/noExplicitAny: generically inferred */
import type { ReactNode } from "react";
import { type RenderOptions, type RenderResult, render } from "vitest-browser-react";

import type { UnionToIntersection } from "$/types";

export type Decorator<TContext extends Record<string, unknown> = Record<string, never>> = () => {
	render: (node: ReactNode) => ReactNode;
	context: TContext;
};

export function createRender<T extends readonly Decorator<any>[]>(...decorators: T) {
	type InferContext<T> = T extends Decorator<infer U> ? U : never;
	type MergeContexts = UnionToIntersection<InferContext<T[number]>>;

	return async (node: ReactNode, options?: Omit<RenderOptions, "wrapper">): Promise<RenderResult & MergeContexts> => {
		let wrapper = node;
		let context = {} as MergeContexts;

		for (const decorator of decorators) {
			const result = decorator();
			wrapper = result.render(wrapper);
			context = { ...context, ...result.context };
		}

		const result = await render(node, { ...options, wrapper: () => wrapper });
		return { ...result, ...context };
	};
}
