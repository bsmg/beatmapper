import { type ReactNode, useMemo } from "react";

import { For } from "$/components/ui/atoms";
import type { IEventTrack, IEventTracks } from "$/types";

interface Props {
	tracks: IEventTracks;
	children: (track: IEventTrack, trackId: number) => ReactNode;
}
function ForEventTracks({ tracks, children }: Props) {
	const items = useMemo(() => {
		return Object.entries(tracks).map(([id, track]) => {
			const trackId = Number.parseInt(id, 10);
			return { track, id: trackId };
		});
	}, [tracks]);

	return <For each={items}>{({ track, id }) => children(track, id)}</For>;
}

export default ForEventTracks;
