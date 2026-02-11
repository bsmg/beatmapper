import { useParams } from "@tanstack/react-router";
import { type CSSProperties, type ReactNode, useMemo } from "react";

import { For } from "$/components/ui/atoms";
import { isSideTrack } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectEventsEditorMirrorLock, selectEventsEditorTrackHeight, selectEventTracksForEnvironment } from "$/store/selectors";
import type { IEventTrack } from "$/types";

interface Props {
	children: (track: IEventTrack, trackId: number, ctx: { disabled: boolean; style: CSSProperties }) => ReactNode;
}
function ForEventTracks({ children }: Props) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const style = useAppSelector((state) => {
		return { height: selectEventsEditorTrackHeight(state) };
	});

	const items = useMemo(() => {
		return Object.entries(tracks).map(([id, track]) => {
			const trackId = Number.parseInt(id, 10);
			return { track, id: trackId, disabled: areLasersLocked && isSideTrack(trackId, "right", tracks) };
		});
	}, [tracks, areLasersLocked]);

	return <For each={items}>{({ track, id, disabled }) => children(track, id, { disabled, style })}</For>;
}

export default ForEventTracks;
