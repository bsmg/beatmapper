import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";

import { store } from "$/setup";
import { leaveEditor, startLoadingSong } from "$/store/actions";

import { styled } from "$:styled-system/jsx";
import { EditorPrompts, EditorSidebar } from "$/components/app/templates/editor";

export const Route = createFileRoute("/_/edit/$sid/$bid/_")({
	component: RouteComponent,
	// HACK: We're duplicating the state between the URL (/edit/:songId) and Redux (state.active.song).
	// This is because having the URL as the sole source of truth was a HUGE pain in the butt.
	// This way is overall much nicer, but it has this one big issue: syncing the state initially.
	// Our locally-persisted state might be out of date. We need to fix that before we do anything else.
	onEnter: async ({ params }) => {
		await Promise.resolve(store.dispatch(startLoadingSong({ songId: params.sid, difficulty: params.bid })));
	},
	onLeave: async ({ params }) => {
		await Promise.resolve(store.dispatch(leaveEditor({ songId: params.sid, difficulty: params.bid })));
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
