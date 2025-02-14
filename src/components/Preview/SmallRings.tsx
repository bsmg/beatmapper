import { useState } from "react";

import { useOnChange } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllBasicEventsForTrack, selectCursorPositionInBeats, selectGraphicsQuality, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";
import { App, Quality } from "$/types";
import { range } from "$/utils";
import { findMostRecentEventInTrack } from "./Preview.helpers";

import BracketRing from "./BracketRing";

const INITIAL_ROTATION = Math.PI * 0.25;
const INCREMENT_ROTATION_BY = Math.PI * 0.5;
const DISTANCE_BETWEEN_RINGS_MIN = 3;
const DISTANCE_BETWEEN_RINGS_MAX = 10;

interface Props {
	isPlaying: boolean;
}

const SmallRings = ({ isPlaying }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, songId));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, songId));

	const lastZoomEvent = useAppSelector((state) => {
		if (!songId || !currentBeat) return null;
		const zoomEvents = selectAllBasicEventsForTrack(state, App.TrackId[9]);
		const lastZoomEvent = findMostRecentEventInTrack(zoomEvents, currentBeat, processingDelayInBeats);
		return lastZoomEvent;
	});
	const lastRotationEvent = useAppSelector((state) => {
		if (!songId || !currentBeat) return null;
		const rotationEvents = selectAllBasicEventsForTrack(state, App.TrackId[8]);
		const lastRotationEvent = findMostRecentEventInTrack(rotationEvents, currentBeat, processingDelayInBeats);
		return lastRotationEvent;
	});
	const numOfRings = useAppSelector((state) => {
		const graphicsLevel = selectGraphicsQuality(state);

		let numOfRings: number;
		switch (graphicsLevel) {
			case Quality.HIGH: {
				numOfRings = 16;
				break;
			}
			case Quality.MEDIUM: {
				numOfRings = 12;
				break;
			}
			case Quality.LOW: {
				numOfRings = 8;
				break;
			}
		}

		return numOfRings;
	});

	const lastZoomEventId = lastZoomEvent ? lastZoomEvent.id : null;
	const lastRotationEventId = lastRotationEvent ? lastRotationEvent.id : null;
	const firstRingOffset = -8;

	const [distanceBetweenRings, setDistanceBetweenRings] = useState(DISTANCE_BETWEEN_RINGS_MIN);

	const [rotationRatio, setRotationRatio] = useState(0.1);

	useOnChange(() => {
		if (!isPlaying) {
			return;
		}

		if (lastZoomEventId) {
			setDistanceBetweenRings(distanceBetweenRings === DISTANCE_BETWEEN_RINGS_MAX ? DISTANCE_BETWEEN_RINGS_MIN : DISTANCE_BETWEEN_RINGS_MAX);
		}
	}, lastZoomEventId);

	// TODO: Custom hook that is shared with LargeRings
	useOnChange(() => {
		if (!isPlaying || !lastRotationEventId) {
			return;
		}

		const shouldChangeDirection = Math.random() < 0.5;
		const directionMultiple = shouldChangeDirection ? 1 : -1;

		setRotationRatio(rotationRatio + INCREMENT_ROTATION_BY * directionMultiple);
	}, lastRotationEventId);

	return range(numOfRings).map((index) => <BracketRing key={index} size={16} thickness={0.4} y={-2} z={firstRingOffset + distanceBetweenRings * index * -1} rotation={INITIAL_ROTATION + index * rotationRatio} color="#1C1C1C" />);
};

export default SmallRings;
