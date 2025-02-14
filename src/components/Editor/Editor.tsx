import { Fragment, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import styled from "styled-components";

import { COLORS, SIDEBAR_WIDTH } from "$/constants";
import { leaveEditor, startLoadingSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import Download from "../Download";
import EditorPrompts from "../EditorPrompts";
import Events from "../Events";
import LoadingScreen from "../LoadingScreen";
import NotesEditor from "../NotesEditor";
import Preview from "../Preview";
import Sidebar from "../Sidebar";
import SongDetails from "../SongDetails";
import EditorErrors from "./EditorErrors";

const Editor = () => {
	const { songId, difficulty } = useParams();

	const activeSongId = useAppSelector(selectActiveSongId);
	const dispatch = useAppDispatch();

	const isCorrectSongSelected = activeSongId && songId === activeSongId;

	// HACK: We're duplicating the state between the URL (/edit/:songId) and Redux (state.active.song).
	// This is because having the URL as the sole source of truth was a HUGE pain in the butt.
	// This way is overall much nicer, but it has this one big issue: syncing the state initially.

	// Our locally-persisted state might be out of date. We need to fix that before we do anything else.
	useEffect(() => {
		dispatch(startLoadingSong({ songId: songId as SongId, difficulty: difficulty as BeatmapId }));
	}, [dispatch, songId, difficulty]);

	useEffect(() => {
		return () => {
			dispatch(leaveEditor({ songId: songId as SongId, difficulty: difficulty as BeatmapId }));
		};
	}, [dispatch, songId, difficulty]);

	if (!activeSongId || !isCorrectSongSelected) {
		return <LoadingScreen />;
	}

	return (
		<Fragment>
			<Sidebar />

			<Wrapper>
				<EditorErrors>
					<Routes>
						<Route path="/notes" element={<NotesEditor songId={activeSongId} />} />
						<Route path="/events" element={<Events songId={activeSongId} />} />
						<Route path="/preview" element={<Preview />} />
						<Route path="/details" element={<SongDetails songId={activeSongId} />} />
						<Route path="/download" element={<Download songId={activeSongId} />} />
					</Routes>
				</EditorErrors>
			</Wrapper>

			<EditorPrompts />
		</Fragment>
	);
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: ${SIDEBAR_WIDTH}px;
  right: 0;
  bottom: 0;
  background: ${COLORS.blueGray[1000]};
`;

export default Editor;
