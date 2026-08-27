import type { TimeProcessor } from "bsmap";
import { type MouseEvent, type ReactNode, useMemo } from "react";

import { For } from "$/components/ui/atoms";
import type { App } from "$/types";

interface Props {
	markers: App.IBookmark[];
	duration: number;
	offset: number;
	timeProcessor: TimeProcessor;
	onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void;
	children: (marker: App.IBookmark, ctx: { offset: number; onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void }) => ReactNode;
}
function AudioVisualizerMarkers({ markers, duration, offset, timeProcessor, onMarkerClick, children }: Props) {
	const allMarkers = useMemo(() => {
		// Add the bookmarks in reverse.
		// This way, they stack from left to right, so earlier flags sit in front of later ones. This is important when hovering, to be able to see the flag name
		const reversed = markers.sort((a, b) => b.time - a.time);

		return reversed.map((marker) => {
			const realTimeInSeconds = timeProcessor.toRealTime(marker.time) + offset;
			const offsetPercentage = (realTimeInSeconds / duration) * 100;
			return { ...marker, offset: offsetPercentage };
		});
	}, [timeProcessor, markers, duration, offset]);

	return <For each={allMarkers}>{(bookmark) => children(bookmark, { offset: bookmark.offset, onMarkerClick: onMarkerClick })}</For>;
}

export default AudioVisualizerMarkers;
