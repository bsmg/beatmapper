import type { EventType } from "bsmap";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectAllBasicEventsForTrack, selectCursorPositionInBeats, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";
import type { Accept, App, SongId } from "$/types";

function findLastEventInTrack<T extends App.IBasicEvent>(events: App.IBasicEvent[], currentBeat: number, processingDelayInBeats: number) {
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.time <= currentBeat + processingDelayInBeats) {
			return event as T;
		}
	}
	return null;
}

export interface UseEventTrackOptions {
	sid: SongId;
	trackId: Accept<EventType, number>;
}
export function useEventTrack({ sid, trackId }: UseEventTrackOptions) {
	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, sid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrack(state, trackId));

	const lastEvent = useMemo(() => {
		if (!sid || currentBeat === null) return null;
		return findLastEventInTrack(events, currentBeat, processingDelayInBeats);
	}, [sid, events, currentBeat, processingDelayInBeats]);

	return [lastEvent];
}
