import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";

import { KBD } from "$/components/ui/styled";
import Mouse from "./Mouse";
import { Shortcut } from "./ShortcutHelpers";

const sharedComponents: MDXComponents = {
	a: ({ ...rest }) => <a {...rest} target="_blank" />,
	Key: ({ children }) => <KBD>{children}</KBD>,
	Mouse: Mouse,
	Shortcut: ({ separator, children }) => <Shortcut separator={separator}>{children}</Shortcut>,
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
