import { evaluateSync } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { forwardRef, memo, useMemo } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { AnchorLink } from "$/components/ui/compositions";
import { css, cx } from "$:styled-system/css";

const DEFAULT_COMPONENTS: MDXComponents = {
	a: forwardRef(({ className, ...rest }, ref) => <AnchorLink ref={ref} target="_blank" {...rest} className={cx(css({ color: "yellow.500" }), className)} />),
};

interface MDXProps {
	code: string;
	components?: MDXComponents;
}
export const MDXRender = memo(({ code, components }: MDXProps) => {
	// @ts-expect-error
	const { default: Component } = useMemo(() => evaluateSync(code, { Fragment, jsx, jsxs, jsxDEV }), [code]);
	const sharedComponents = useMemo(() => ({ ...DEFAULT_COMPONENTS, ...components }), [components]);
	return <Component components={sharedComponents} />;
});
