import { useTrail } from "@react-spring/three";
import { useState } from "react";
import type { Vector3Tuple } from "three";

import { getColorForItem } from "$/helpers/colors.helpers";
import { useOnChange } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllBasicEventsForTrack, selectAnimateRingMotion, selectCursorPositionInBeats, selectCustomColors, selectGraphicsQuality, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";
import { App, Quality } from "$/types";
import { findMostRecentEventInTrack } from "./Preview.helpers";

import LitSquareRing from "./LitSquareRing";

const INITIAL_ROTATION = Math.PI * 0.25;
const INCREMENT_ROTATION_BY = Math.PI * 0.5;
const DISTANCE_BETWEEN_RINGS = 18;

interface Props {
	isPlaying: boolean;
}

const LargeRings = ({ isPlaying }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, songId));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, songId));

	const lastRotationEvent = useAppSelector((state) => {
		if (!songId || !currentBeat) return null;
		const rotationEvents = selectAllBasicEventsForTrack(state, App.TrackId[8]);
		const lastRotationEvent = findMostRecentEventInTrack<App.IBasicTriggerEvent>(rotationEvents, currentBeat, processingDelayInBeats);
		return lastRotationEvent;
	});
	const lastLightingEvent = useAppSelector((state) => {
		if (!songId || !currentBeat) return null;
		const lightingEvents = selectAllBasicEventsForTrack(state, App.TrackId[1]);
		const lastLightingEvent = findMostRecentEventInTrack<App.IBasicLightEvent>(lightingEvents, currentBeat, processingDelayInBeats);
		return lastLightingEvent;
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
	const animateRingMotion = useAppSelector(selectAnimateRingMotion);

	const lastRotationEventId = lastRotationEvent ? lastRotationEvent.id : null;

	const firstRingOffset = -60;

	const [rotationRatio, setRotationRatio] = useState(0);

	const lightStatus = lastLightingEvent ? lastLightingEvent.type : App.BasicEventType.OFF;
	const lastLightingEventId = lastLightingEvent ? lastLightingEvent.id : null;
	const lightColor = lightStatus === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastLightingEvent?.colorType, customColors);

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
