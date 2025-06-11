import type { MouseEvent, ReactNode } from "react";

import type { App } from "$/types";

interface Props {
	markers: App.IBookmark[];
	duration: number;
	offset?: number;
	onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void;
	children: (marker: App.IBookmark, ctx: { offset: number; onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void }) => ReactNode;
}
function AudioVisualizerMarkers({ markers, duration, offset, onMarkerClick, children }: Props) {
	// Add the bookmarks in reverse.
	// This way, they stack from left to right, so earlier flags sit in front of later ones. This is important when hovering, to be able to see the flag name
	return [...markers].reverse().map((bookmark) => {
		const beatNumWithOffset = bookmark.time + (offset ?? 0);
		const offsetPercentage = (beatNumWithOffset / duration) * 100;
		return children(bookmark, { offset: offsetPercentage, onMarkerClick: onMarkerClick });
	});
}

export default AudioVisualizerMarkers;
