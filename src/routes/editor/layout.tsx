import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo } from "react";

import { leaveEditor, startLoadingSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId } from "$/store/selectors";

import { styled } from "$:styled-system/jsx";
import { PendingBoundary } from "$/components/app/layouts";
import { EditorPrompts, EditorSidebar } from "$/components/app/templates/editor";

export const Route = createFileRoute("/_/edit/$sid/$bid/_")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();

	const activeSongId = useAppSelector(selectActiveSongId);
	const dispatch = useAppDispatch();

	const isCorrectSongSelected = useMemo(() => activeSongId && sid === activeSongId, [activeSongId, sid]);

	// HACK: We're duplicating the state between the URL (/edit/:songId) and Redux (state.active.song).
	// This is because having the URL as the sole source of truth was a HUGE pain in the butt.
	// This way is overall much nicer, but it has this one big issue: syncing the state initially.

	// Our locally-persisted state might be out of date. We need to fix that before we do anything else.
	useEffect(() => {
		dispatch(startLoadingSong({ songId: sid, difficulty: bid }));
	}, [dispatch, sid, bid]);

	useEffect(() => {
		return () => {
			dispatch(leaveEditor({ songId: sid, difficulty: bid }));
		};
	}, [dispatch, sid, bid]);

	if (!activeSongId || !isCorrectSongSelected) {
		return <PendingBoundary />;
	}

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
