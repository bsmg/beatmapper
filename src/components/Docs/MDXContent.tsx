import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";

import Mouse from "./Mouse";
import { KeyIcon, MetaKey, OptionKey } from "./ShortcutHelpers";

const sharedComponents: MDXComponents = {
	a: ({ ...rest }) => <a {...rest} target="_blank" />,
	MetaKey,
	OptionKey,
	Key: ({ children }) => <KeyIcon size="small">{children}</KeyIcon>,
	Mouse: Mouse,
};

export function useMDXComponent(code: string) {
	const fn = new Function(code);
	return { ...fn({ ...runtime }) };
}

interface MDXProps {
	code: string;
	components?: MDXComponents;
}
export function MDXContent({ code, components }: MDXProps) {
	const { default: Component } = useMDXComponent(code);
	return <Component components={{ ...sharedComponents, ...components }} />;
}
