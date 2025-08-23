import { evaluateSync } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { memo, useMemo } from "react";
import * as runtime from "react/jsx-runtime";

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
	// @ts-ignore
	const { default: Component } = useMemo(() => evaluateSync(code, { ...runtime }), [code]);
	const sharedComponents = useMemo(() => ({ ...DEFAULT_COMPONENTS, ...components }), [components]);
	return <Component components={sharedComponents} />;
});
