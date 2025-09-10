import { evaluateSync } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { memo, useMemo } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { css } from "$:styled-system/css";
import { AnchorLink } from "../styled";

const DEFAULT_COMPONENTS: MDXComponents = {
	a: ({ ref, ...rest }) => <AnchorLink target="_blank" className={css({ color: "yellow.500" })} {...rest} />,
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
