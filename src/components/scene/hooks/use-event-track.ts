import { useAppSelector } from "$/store/hooks";
import { selectAllBasicEventsForTrack, selectCursorPositionInBeats, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";
import type { App, SongId } from "$/types";

function findMostRecentEventInTrack<T extends App.BasicEvent>(events: App.BasicEvent[], currentBeat: number, processingDelayInBeats: number) {
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.beatNum < currentBeat + processingDelayInBeats) {
			return event as T;
		}
	}

	return null;
}

export interface UseEventTrackOptions {
	sid: SongId;
	trackId: App.TrackId;
}
export function useEventTrack<T extends App.BasicEvent>({ sid, trackId }: UseEventTrackOptions) {
	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, sid));

	const lastEvent = useAppSelector((state) => {
		if (!sid || !currentBeat) return null;
		const events = selectAllBasicEventsForTrack(state, trackId);
		const lastEvent = findMostRecentEventInTrack<T>(events, currentBeat, processingDelayInBeats);
		return lastEvent;
	});

	return lastEvent;
}
