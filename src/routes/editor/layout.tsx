import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect } from "react";
import styled from "styled-components";

import { COLORS, SIDEBAR_WIDTH } from "$/constants";
import { leaveEditor, startLoadingSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId } from "$/store/selectors";

import EditorPrompts from "$/components/legacy/EditorPrompts";
import LoadingScreen from "$/components/legacy/LoadingScreen";
import Sidebar from "$/components/legacy/Sidebar";

export const Route = createFileRoute("/_/edit/$sid/$bid/_")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid: songId, bid: difficulty } = Route.useParams();

	const activeSongId = useAppSelector(selectActiveSongId);
	const dispatch = useAppDispatch();

	const isCorrectSongSelected = activeSongId && songId === activeSongId;

	// HACK: We're duplicating the state between the URL (/edit/:songId) and Redux (state.active.song).
	// This is because having the URL as the sole source of truth was a HUGE pain in the butt.
	// This way is overall much nicer, but it has this one big issue: syncing the state initially.

	// Our locally-persisted state might be out of date. We need to fix that before we do anything else.
	useEffect(() => {
		dispatch(startLoadingSong({ songId: songId, difficulty: difficulty }));
	}, [dispatch, songId, difficulty]);

	useEffect(() => {
		return () => {
			dispatch(leaveEditor({ songId: songId, difficulty: difficulty }));
		};
	}, [dispatch, songId, difficulty]);

	if (!activeSongId || !isCorrectSongSelected) {
		return <LoadingScreen />;
	}

	return (
		<Fragment>
			<Sidebar />
			<Wrapper>
				<Outlet />
			</Wrapper>
			<EditorPrompts />
		</Fragment>
	);
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: ${SIDEBAR_WIDTH}px;
  right: 0;
  bottom: 0;
  background: ${COLORS.blueGray[1000]};
`;
