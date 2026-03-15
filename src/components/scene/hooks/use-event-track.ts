import { useParams } from "@tanstack/react-router";
import type { IWrapBaseObject, IWrapBasicEvent, IWrapColorBoostEvent } from "bsmap";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectAllBasicEventsForTrack, selectAllBoostEvents, selectCursorPositionInBeats } from "$/store/selectors";

function findLastEventInTrack<T extends IWrapBaseObject>(events: T[], currentBeat: number): [T | null, T | null] {
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

	return useMemo((): [lastEvent: IWrapBasicEvent | null, nextEvent: IWrapBasicEvent | null] => {
		if (!sid || currentBeat === null) return [null, null] as const;
		return findLastEventInTrack(basicEvents, currentBeat);
	}, [sid, basicEvents, currentBeat]);
}

export function useBoostEventTrack() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const boostEvents = useAppSelector((state) => selectAllBoostEvents(state));

	return useMemo((): [lastEvent: IWrapColorBoostEvent | null, nextEvent: IWrapColorBoostEvent | null] => {
		if (!sid || currentBeat === null) return [null, null] as const;
		return findLastEventInTrack(boostEvents, currentBeat);
	}, [sid, boostEvents, currentBeat]);
}
