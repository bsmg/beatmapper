import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { AppPrompter, Shortcut } from "$/components/app/compositions";
import { EDITOR_TOASTER } from "$/components/app/constants";
import { EditorPrompts, EditorSidebar } from "$/components/app/templates/editor";
import { MDXContent } from "$/components/ui/atoms";
import { List, Text } from "$/components/ui/compositions";
import { store } from "$/setup";
import { dismissPrompt, leaveEditor, startLoadingMap } from "$/store/actions";
import { selectAnnouncements, selectBeatmapEntities } from "$/store/selectors";
import type { View } from "$/types";
import { prompts } from "$:content";
import { css } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";

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
	beforeLoad: ({ location }) => {
		const segments = location.pathname.split("/");

		return {
			view: segments[segments.length - 1] as View,
		};
	},
	loader: () => {
		const state = store.getState();
		const seenPrompts = selectAnnouncements(state);

		return {
			unseenPrompt: prompts.find((prompt) => !seenPrompts.includes(prompt.id)),
		};
	},
	onEnter: async ({ params, loaderData }) => {
		await Promise.resolve(store.dispatch(startLoadingMap({ songId: params.sid, beatmapId: params.bid })));

		if (loaderData && "unseenPrompt" in loaderData) {
			const { unseenPrompt } = loaderData;

			if (unseenPrompt) {
				EDITOR_TOASTER.create({
					id: unseenPrompt.id,
					type: "loading",
					title: unseenPrompt.title,
					description: <MDXContent code={unseenPrompt.code} components={EDITOR_PROMPT_COMPONENTS} />,
					onStatusChange: (details) => {
						if (details.status === "dismissing") store.dispatch(dismissPrompt({ id: unseenPrompt.id }));
					},
				});
			}
		}
	},
	onLeave: async ({ params }) => {
		const state = store.getState();
		const entities = selectBeatmapEntities(state);

		await Promise.resolve(store.dispatch(leaveEditor({ songId: params.sid, beatmapId: params.bid, entities })));
	},
});

function RouteComponent() {
	return (
		<AppPrompter>
			<EditorSidebar />
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
