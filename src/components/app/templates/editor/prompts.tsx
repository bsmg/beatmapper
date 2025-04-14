import { prompts } from "velite:content";
import { createToaster } from "@ark-ui/react/toast";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { useMount } from "$/components/hooks";
import { dismissPrompt } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSeenPrompts } from "$/store/selectors";

import { Shortcut } from "$/components/app/compositions";
import { MDXContent } from "$/components/ui/atoms";
import { List, Text, Toaster } from "$/components/ui/compositions";

const components: MDXComponents = {
	a: ({ ...rest }) => (
		<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
			<a {...rest} target="_blank" />
		</Text>
	),
	p: ({ ...rest }) => (
		<Text asChild textStyle={"paragraph"}>
			<p {...rest} />
		</Text>
	),
	ul: ({ ref, ...rest }) => <List.Root type="unordered" variant="marker" {...rest} />,
	li: ({ ref, ...rest }) => <List.Item {...rest} />,
	Shortcut: ({ separator, children }: ComponentProps<typeof Shortcut>) => <Shortcut separator={separator}>{children}</Shortcut>,
};

const toaster = createToaster({
	placement: "top-end",
	max: 1,
});

function EditorPrompts() {
	const prompt = useAppSelector((state) => {
		const seenPrompts = selectSeenPrompts(state);
		const unseenPrompts = prompts.filter((prompt) => !seenPrompts.includes(prompt.id));
		return unseenPrompts[0];
	});
	const dispatch = useAppDispatch();

	useMount(() => {
		if (!prompt) return;
		toaster.create({
			id: prompt.id,
			type: "loading",
			title: prompt.title,
			description: <MDXContent code={prompt.code} components={components} />,
			onStatusChange: (details) => {
				if (details.status === "dismissing") dispatch(dismissPrompt({ promptId: prompt.id }));
			},
		});
	});

	return <Toaster toaster={toaster} />;
}

export default EditorPrompts;
