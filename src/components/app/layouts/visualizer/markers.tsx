import { type MouseEvent, type ReactNode, useMemo } from "react";

import { For } from "$/components/ui/atoms";
import type { App } from "$/types";

interface Props {
	markers: App.IBookmark[];
	duration: number;
	offset?: number;
	onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void;
	children: (marker: App.IBookmark, ctx: { offset: number; onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void }) => ReactNode;
}
function AudioVisualizerMarkers({ markers, duration, offset, onMarkerClick, children }: Props) {
	const allMarkers = useMemo(() => {
		// Add the bookmarks in reverse.
		// This way, they stack from left to right, so earlier flags sit in front of later ones. This is important when hovering, to be able to see the flag name
		const reversed = markers.sort((a, b) => b.time - a.time);

		return reversed.map((marker) => {
			const beatNumWithOffset = marker.time + (offset ?? 0);
			const offsetPercentage = (beatNumWithOffset / duration) * 100;
			return { ...marker, offset: offsetPercentage };
		});
	}, [markers, duration, offset]);

	return <For each={allMarkers}>{(bookmark) => children(bookmark, { offset: bookmark.offset, onMarkerClick: onMarkerClick })}</For>;
}

export default AudioVisualizerMarkers;
