import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";

import Mouse from "./Mouse";
import { KeyIcon, Shortcut } from "./ShortcutHelpers";

const sharedComponents: MDXComponents = {
	a: ({ ...rest }) => <a {...rest} target="_blank" />,
	Key: ({ size, children }) => <KeyIcon size={size ?? "small"}>{children}</KeyIcon>,
	Mouse: Mouse,
	Shortcut: ({ size, separator, children }) => (
		<Shortcut separator={separator} size={size ?? "small"}>
			{children}
		</Shortcut>
	),
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
