import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import { forwardRef } from "react";

import { EDITOR_TOASTER } from "$/components/app/constants";
import { EditorPrompts, EditorSidebar } from "$/components/app/templates/editor";
import { MDX } from "$/components/ui/atoms";
import { AnchorLink, List, Prompter, Shortcut } from "$/components/ui/compositions";
import { store } from "$/setup";
import { dismissPrompt, leaveEditor, startLoadingMap } from "$/store/actions";
import { selectAnnouncements, selectBeatmapEntities } from "$/store/selectors";
import type { View } from "$/types";
import { prompts } from "$:content";
import { css, cx } from "$:styled-system/css";
import { styled, Text } from "$:styled-system/jsx";

const EDITOR_PROMPT_COMPONENTS: MDXComponents = {
	a: forwardRef(({ className, ...rest }, ref) => <AnchorLink ref={ref} target="_blank" {...rest} className={cx(css({ color: "yellow.500" }), className)} />),
	p: forwardRef(({ className, ...rest }, ref) => <Text as={"p"} ref={ref} {...rest} textStyle={"paragraph"} className={cx(css({ marginBlockStart: { base: 1.5, _first: 0 }, marginBlockEnd: { base: 1.5, _last: 0 } }), className)} />),
	ul: forwardRef(({ ...rest }, ref) => <List.Root ref={ref} type="unordered" variant="marker" {...rest} />),
	li: forwardRef(({ ...rest }, ref) => <List.Item ref={ref} {...rest} />),
	Shortcut,
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
					description: <MDX code={unseenPrompt.code} components={EDITOR_PROMPT_COMPONENTS} />,
					closable: true,
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
		<Prompter>
			<EditorSidebar />
			<Wrapper>
				<Outlet />
			</Wrapper>
			<EditorPrompts />
		</Prompter>
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
