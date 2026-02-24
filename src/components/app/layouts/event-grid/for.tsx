import { useParams } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";

import { For } from "$/components/ui/atoms";
import { useAppSelector } from "$/store/hooks";
import { selectEventTracksForEnvironment } from "$/store/selectors";
import type { IEventTrack } from "$/types";

interface Props {
	children: (track: IEventTrack, trackId: number) => ReactNode;
}
function ForEventTracks({ children }: Props) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));

	const items = useMemo(() => {
		return Object.entries(tracks).map(([id, track]) => {
			const trackId = Number.parseInt(id, 10);
			return { track, id: trackId };
		});
	}, [tracks]);

	return <For each={items}>{({ track, id }) => children(track, id)}</For>;
}

export default ForEventTracks;
