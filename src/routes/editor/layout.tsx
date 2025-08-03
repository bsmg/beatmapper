import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { prompts } from "$:content";
import { EDITOR_TOASTER } from "$/components/app/constants";
import { store } from "$/setup";
import { dismissPrompt, leaveEditor, startLoadingMap } from "$/store/actions";
import { selectAnnouncements } from "$/store/selectors";

import { css } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";
import { AppPrompter, Shortcut } from "$/components/app/compositions";
import { useViewFromLocation } from "$/components/app/hooks";
import { EditorPrompts, EditorSidebar } from "$/components/app/templates/editor";
import { MDXContent } from "$/components/ui/atoms";
import { List, Text } from "$/components/ui/compositions";

const EDITOR_PROMPT_COMPONENTS: MDXComponents = {
	a: ({ ...rest }) => (
		<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
			<a {...rest} />
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

export const Route = createFileRoute("/_/edit/$sid/$bid/_")({
	component: RouteComponent,
	loader: () => {
		const state = store.getState();
		const seenPrompts = selectAnnouncements(state);
		const unseenPrompts = prompts.filter((prompt) => !seenPrompts.includes(prompt.id));
		const prompt = unseenPrompts[0];
		return { prompt };
	},
	onEnter: async ({ params, loaderData }) => {
		await Promise.resolve(store.dispatch(startLoadingMap({ songId: params.sid, beatmapId: params.bid })));
		if (loaderData && "prompt" in loaderData) {
			const { prompt } = loaderData;
			if (!prompt) return;
			EDITOR_TOASTER.create({
				id: prompt.id,
				type: "loading",
				title: prompt.title,
				description: <MDXContent code={prompt.code} components={EDITOR_PROMPT_COMPONENTS} />,
				onStatusChange: (details) => {
					if (details.status === "dismissing") store.dispatch(dismissPrompt({ id: prompt.id }));
				},
			});
		}
	},
	onLeave: async ({ params }) => {
		await Promise.resolve(store.dispatch(leaveEditor({ songId: params.sid, beatmapId: params.bid })));
	},
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const view = useViewFromLocation();

	return (
		<AppPrompter sid={sid} view={view}>
			<EditorSidebar sid={sid} bid={bid} />
			<Wrapper>
				<Outlet />
			</Wrapper>
			<EditorPrompts />
		</AppPrompter>
	);
}

const Wrapper = styled("div", {
	base: {
		position: "fixed",
		insetBlock: 0,
		left: "{sizes.sidebar}",
		right: 0,
		backgroundColor: "bg.canvas",
	},
});
