import { prompts } from "velite:content";

import { dismissPrompt } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSeenPrompts } from "$/store/selectors";

import { List, Text, Toaster } from "$/components/ui/compositions";
import { useMount } from "$/hooks";
import { createToaster } from "@ark-ui/react";
import { MDXContent } from "../Docs/MDXContent";

const components = {
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
	ul: ({ ...rest }) => <List.Root {...rest} type="unordered" variant="plain" />,
	li: ({ ...rest }) => <List.Item {...rest} />,
};

const toaster = createToaster({
	placement: "top-end",
	max: 1,
});

const EditorPrompts = () => {
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
};

export default EditorPrompts;
