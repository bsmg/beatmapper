import { useParams } from "@tanstack/react-router";
import type { wrapper } from "bsmap/types";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectAllBasicEventsForTrack, selectCursorPositionInBeats } from "$/store/selectors";

function findLastEventInTrack<T extends wrapper.IWrapBaseObject>(events: T[], currentBeat: number): [T | null, T | null] {
	for (let i = events.length - 1; i >= 0; i--) {
		const lastEvent = events[i];
		const nextEvent = events[i + 1];
		if (lastEvent.time <= currentBeat) {
			return [lastEvent, nextEvent] as const;
		}
	}
	return [null, null] as const;
}

export interface UseBasicEventTrackOptions {
	trackId: number;
}
export function useBasicEventTrack({ trackId }: UseBasicEventTrackOptions) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const basicEvents = useAppSelector((state) => selectAllBasicEventsForTrack(state, trackId));

	return useMemo((): [lastEvent: wrapper.IWrapBasicEvent | null, nextEvent: wrapper.IWrapBasicEvent | null] => {
		if (!sid || currentBeat === null) return [null, null] as const;
		return findLastEventInTrack(basicEvents, currentBeat);
	}, [sid, basicEvents, currentBeat]);
}
