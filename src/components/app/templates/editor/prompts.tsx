import { createToaster } from "@ark-ui/react/toast";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { css } from "$:styled-system/css";
import { Shortcut } from "$/components/app/compositions";
import { List, Text, Toaster } from "$/components/ui/compositions";

export const EDITOR_PROMPT_COMPONENTS: MDXComponents = {
	a: ({ ...rest }) => (
		<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
			<a {...rest} target="_blank" />
		</Text>
	),
	p: ({ ...rest }) => (
		<Text asChild textStyle={"paragraph"} className={css({ marginBlockStart: { base: 1.5, _first: 0 }, marginBlockEnd: { base: 1.5, _last: 0 } })}>
			<p {...rest} />
		</Text>
	),
	ul: ({ ref, ...rest }) => <List.Root type="unordered" variant="marker" {...rest} />,
	li: ({ ref, ...rest }) => <List.Item {...rest} />,
	Shortcut: ({ separator, children }: ComponentProps<typeof Shortcut>) => <Shortcut separator={separator}>{children}</Shortcut>,
};

export const EDITOR_TOASTER = createToaster({
	placement: "top-end",
	max: 1,
});

function EditorPrompts() {
	return <Toaster toaster={EDITOR_TOASTER} />;
}

export default EditorPrompts;
