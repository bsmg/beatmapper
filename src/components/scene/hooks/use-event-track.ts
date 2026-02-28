import { useParams } from "@tanstack/react-router";
import type { wrapper } from "bsmap/types";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectAllBasicEventsForTrack, selectCursorPositionInBeats, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";

function findLastEventInTrack<T extends wrapper.IWrapBaseObject>(events: T[], currentBeat: number, processingDelayInBeats: number) {
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.time <= currentBeat + processingDelayInBeats) {
			return event as T;
		}
	}
	return null;
}

export interface UseBasicEventTrackOptions {
	trackId: number;
}
export function useBasicEventTrack({ trackId }: UseBasicEventTrackOptions) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, sid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrack(state, trackId));

	const lastEvent = useMemo(() => {
		if (!sid || currentBeat === null) return null;
		return findLastEventInTrack(events, currentBeat, processingDelayInBeats);
	}, [sid, events, currentBeat, processingDelayInBeats]);

	return [lastEvent];
}
