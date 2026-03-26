import { type EvaluateOptions, evaluate, type Jsx, type JsxDev } from "@mdx-js/mdx";
import { useQuery } from "@tanstack/react-query";
import type { MDXModule, MDXProps } from "mdx/types";
import { type ReactNode, useMemo } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

const runtime: EvaluateOptions = { Fragment: Fragment, jsx: jsx as Jsx, jsxs: jsxs as Jsx, jsxDEV: jsxDEV as JsxDev };

export function MDX({ code, components }: MDXProps & { code: string }) {
	const { default: Component } = useMemo(() => {
		const fn = new Function(code);
		return fn(runtime) as MDXModule;
	}, [code]);

	return <Component components={{ ...components }} />;
}

export function MDXRemote({ children, fallback = null, components }: MDXProps & { children: string; fallback?: ReactNode }) {
	const { data: Component } = useQuery({
		queryKey: ["mdx", children.slice(0, 20)],
		queryFn: async () => {
			const { default: Component } = await evaluate(children, runtime);
			return Component;
		},
	});

	if (!Component) return fallback;
	return <Component components={components} />;
}
