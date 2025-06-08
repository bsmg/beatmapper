import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";

import { store } from "$/setup";
import { dismissPrompt, leaveEditor, startLoadingMap } from "$/store/actions";

import { styled } from "$:styled-system/jsx";
import { prompts } from "velite:content";
import { EditorPrompts, EditorSidebar } from "$/components/app/templates/editor";
import { EDITOR_PROMPT_COMPONENTS, EDITOR_TOASTER } from "$/components/app/templates/editor/prompts";
import { MDXContent } from "$/components/ui/atoms";
import { selectAnnouncements } from "$/store/selectors";

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
	return (
		<Fragment>
			<EditorSidebar sid={sid} bid={bid} />
			<Wrapper>
				<Outlet />
			</Wrapper>
			<EditorPrompts />
		</Fragment>
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
