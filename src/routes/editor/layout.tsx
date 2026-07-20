import { createToaster } from "@ark-ui/react/toast";
import { toPascalCase } from "@std/text/to-pascal-case";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import { forwardRef } from "react";

import { EditorSidebar } from "$/components/app/templates/editor";
import { MDX } from "$/components/ui/atoms";
import { AnchorLink, List, Prompter, Shortcut, Toaster } from "$/components/ui/compositions";
import { getAppStore } from "$/setup";
import { leaveEditor, startLoadingMap, stopPlayback, updateAnnouncements, updateCursorPosition } from "$/store/actions";
import { selectAnnouncements, selectBeatmapEntities, selectEditorOffset } from "$/store/selectors";
import type { View } from "$/types";
import { prompts } from "$:content";
import { css, cx } from "$:styled-system/css";
import { styled, Text } from "$:styled-system/jsx";

const EDITOR_TOASTER = createToaster({
	placement: "top-end",
	max: 1,
});
const EDITOR_PROMPT_COMPONENTS: MDXComponents = {
	a: forwardRef(({ ...rest }, ref) => <AnchorLink ref={ref} target="_blank" {...rest} />),
	p: forwardRef(({ className, ...rest }, ref) => <Text as={"p"} ref={ref} {...rest} textStyle={"paragraph"} className={cx(css({ marginBlockStart: { base: 1.5, _first: 0 }, marginBlockEnd: { base: 1.5, _last: 0 } }), className)} />),
	ul: forwardRef(({ ...rest }, ref) => <List.Root ref={ref} type="unordered" variant="marker" {...rest} />),
	li: forwardRef(({ ...rest }, ref) => <List.Item ref={ref} {...rest} />),
	Shortcut,
};

let lastParams: { sid: string; bid: string } | null = null;

async function syncEditorLifecycle(cause: "enter" | "stay" | "leave", params: { sid: string; bid: string }) {
	const store = await getAppStore();

	const onEnter = async () => {
		const state = store.getState();

		await Promise.resolve(store.dispatch(startLoadingMap({ songId: params.sid, beatmapId: params.bid })));

		if (cause !== "stay") {
			store.dispatch(updateCursorPosition({ value: selectEditorOffset(state, params.sid) }));
		}

		lastParams = params;
	};
	const onLeave = async () => {
		const store = await getAppStore();
		const state = store.getState();

		if (lastParams) {
			store.dispatch(leaveEditor({ songId: lastParams.sid, beatmapId: lastParams.bid, entities: selectBeatmapEntities(state) }));
		}
	};

	switch (cause) {
		case "enter": {
			return onEnter();
		}
		case "leave": {
			return onLeave();
		}
		default: {
			if (lastParams?.sid !== params.sid || lastParams?.bid !== params.bid) {
				return onLeave().then(() => onEnter());
			}
		}
	}
}

export const Route = createFileRoute("/_/edit/$sid/$bid/_")({
	component: RouteComponent,
	beforeLoad: ({ location }) => {
		const segments = location.pathname.split("/");

		return {
			view: segments[segments.length - 1] as View,
		};
	},
	loader: async ({ context }) => {
		const store = await getAppStore();
		const state = store.getState();
		const seenPrompts = selectAnnouncements(state);

		return {
			view: toPascalCase(context.view),
			unseenPrompt: prompts.find((prompt) => !seenPrompts.includes(prompt.id)),
		};
	},
	head: ({ params, loaderData }) => {
		return { meta: [{ title: loaderData ? `${loaderData.view} ∙ ${params.sid}/${params.bid} ∙ Beatmapper Editor` : "Beatmapper Editor" }] };
	},
	onEnter: async ({ params, loaderData }) => {
		syncEditorLifecycle("enter", params);

		if (loaderData && "unseenPrompt" in loaderData) {
			const { unseenPrompt } = loaderData;

			if (unseenPrompt) {
				const store = await getAppStore();
				const announcements = selectAnnouncements(store.getState());

				EDITOR_TOASTER.create({
					id: unseenPrompt.id,
					type: "loading",
					title: unseenPrompt.title,
					description: <MDX code={unseenPrompt.code} components={EDITOR_PROMPT_COMPONENTS} />,
					closable: true,
					onStatusChange: async (details) => {
						if (details.status === "dismissing") {
							store.dispatch(updateAnnouncements(announcements.concat(unseenPrompt.id)));
						}
					},
				});
			}
		}
	},
	onStay: async ({ params }) => {
		syncEditorLifecycle("stay", params);
	},
	onLeave: async ({ params }) => {
		syncEditorLifecycle("leave", params);

		const store = await getAppStore();
		store.dispatch(stopPlayback({ songId: params.sid }));
	},
});

function RouteComponent() {
	return (
		<Prompter>
			<EditorSidebar />
			<Wrapper>
				<Outlet />
			</Wrapper>
			<Toaster toaster={EDITOR_TOASTER} />
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
