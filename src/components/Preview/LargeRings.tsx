import { useTrail } from "@react-spring/three";
import { useState } from "react";
import type { Vector3Tuple } from "three";

import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { getColorForItem } from "$/helpers/colors.helpers";
import { useOnChange } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { getAnimateRingMotion, getCursorPositionInBeats, getGraphicsLevel, getTracks, getUsableProcessingDelay } from "$/store/selectors";
import { App, Quality } from "$/types";
import { findMostRecentEventInTrack } from "./Preview.helpers";

import LitSquareRing from "./LitSquareRing";

const INITIAL_ROTATION = Math.PI * 0.25;
const INCREMENT_ROTATION_BY = Math.PI * 0.5;
const DISTANCE_BETWEEN_RINGS = 18;

interface Props {
	song: App.Song;
	isPlaying: boolean;
}

const LargeRings = ({ song, isPlaying }: Props) => {
	const lastRotationEvent = useAppSelector((state) => {
		if (!song) {
			return null;
		}

		const tracks = getTracks(state);

		const rotationTrackId = App.TrackId[8];

		const rotationEvents = tracks[rotationTrackId];

		const currentBeat = getCursorPositionInBeats(state);
		if (!currentBeat) return null;
		const processingDelay = getUsableProcessingDelay(state);

		const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);

		const lastRotationEvent = findMostRecentEventInTrack<App.IBasicTriggerEvent>(rotationEvents, currentBeat, processingDelayInBeats);
		return lastRotationEvent;
	});
	const lastLightingEvent = useAppSelector((state) => {
		if (!song) {
			return null;
		}

		const tracks = getTracks(state);

		const lightingTrackId = App.TrackId[1];

		const lightingEvents = tracks[lightingTrackId];

		const currentBeat = getCursorPositionInBeats(state);
		if (!currentBeat) return null;
		const processingDelay = getUsableProcessingDelay(state);

		const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);

		const lastLightingEvent = findMostRecentEventInTrack<App.IBasicLightEvent>(lightingEvents, currentBeat, processingDelayInBeats);

		return lastLightingEvent;
	});
	const numOfRings = useAppSelector((state) => {
		const graphicsLevel = getGraphicsLevel(state);

		let numOfRings: number;
		switch (graphicsLevel) {
			case Quality.HIGH: {
				numOfRings = 16;
				break;
			}
			case Quality.MEDIUM: {
				numOfRings = 8;
				break;
			}
			case Quality.LOW: {
				numOfRings = 4;
				break;
			}
		}
		return numOfRings;
	});
	const animateRingMotion = useAppSelector(getAnimateRingMotion);

	const lastRotationEventId = lastRotationEvent ? lastRotationEvent.id : null;

	const firstRingOffset = -60;

	const [rotationRatio, setRotationRatio] = useState(0);

	const lightStatus = lastLightingEvent ? lastLightingEvent.type : App.BasicEventType.OFF;
	const lastLightingEventId = lastLightingEvent ? lastLightingEvent.id : null;
	const lightColor = lightStatus === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastLightingEvent?.colorType, song);

	// TODO: Custom hook that is shared with SmallRings
	useOnChange(() => {
		if (!isPlaying || !lastRotationEventId) {
			return;
		}

		const shouldChangeDirection = Math.random() < 0.25;
		const directionMultiple = shouldChangeDirection ? 1 : -1;

		setRotationRatio(rotationRatio + INCREMENT_ROTATION_BY * directionMultiple);
	}, lastRotationEventId);

	const trail = useTrail(numOfRings, {
		to: {
			rotation: [0, 0, INITIAL_ROTATION * rotationRatio] as Vector3Tuple,
		},
		immediate: !animateRingMotion,
		config: {
			tension: 2500,
			friction: 600,
			mass: 1,
			precision: 0.001,
		},
	});

	return trail.map((trailProps, index) => (
		<LitSquareRing key={index} index={index} size={128} thickness={2.5} y={-2} z={firstRingOffset + DISTANCE_BETWEEN_RINGS * index * -1} color="#111111" rotation={trailProps.rotation} lightStatus={lightStatus} lightColor={lightColor} lastLightingEventId={lastLightingEventId} isPlaying={isPlaying} />
	));
};

export default LargeRings;
