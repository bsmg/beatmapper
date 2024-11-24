import { Fragment } from "react";

import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { getColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { getCursorPosition, getCursorPositionInBeats, getTracks, getUsableProcessingDelay } from "$/store/selectors";
import { App } from "$/types";
import { convertDegreesToRadians, normalize, range } from "$/utils";
import { findMostRecentEventInTrack } from "./Preview.helpers";

import type { Vector3Tuple } from "three";
import LaserBeam from "./LaserBeam";

// We want to use a sin curve to control laser rotation.
// Math.sin produces a value between -1 and 1, and resets after 2PI, which means if we use the number of seconds since the start of the song, it will complete 1 full rotation every 6.28 seconds.
// I haven't taken the time to work out what the actual speed in-game is, but by approximating,
// it looks like Laser Speed 1 takes about 30 seconds to complete a cycle, whereas Laser Speed 8 (fastest) takes about 6 seconds.
function getSinRotationValue(side: "left" | "right", beamIndex: number, secondsSinceSongStart: number, laserSpeed: number) {
	const defaultRotation = side === "left" ? -55 : 55;

	if (laserSpeed === 0) {
		return defaultRotation;
	}

	// I don't want every beam to sit at exactly the same spot in the sin cycle.
	// In the game, the first 2 lasers follow each other closely, while the remaining ones swivel at seemingly random offsets.
	let beamIndexOffset: number;
	if (beamIndex === 0) {
		beamIndexOffset = 0;
	} else if (beamIndex === 1) {
		beamIndexOffset = 0.1;
	} else {
		beamIndexOffset = beamIndex;
	}

	const sinValue = Math.sin(secondsSinceSongStart * laserSpeed * 0.35 + beamIndexOffset);

	return normalize(sinValue, -1, 1, defaultRotation, defaultRotation * -1);
}

interface Props {
	song: App.Song;
	isPlaying: boolean;
	side: "left" | "right";
}

const SideLaser = ({ song, isPlaying, side }: Props) => {
	const lastEvent = useAppSelector((state) => {
		if (!song) {
			return null;
		}

		const tracks = getTracks(state);

		const trackId = side === "left" ? App.TrackId[2] : App.TrackId[3];

		const lightEvents = tracks[trackId];

		const currentBeat = getCursorPositionInBeats(state);
		if (!currentBeat) return null;
		const processingDelay = getUsableProcessingDelay(state);

		const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);

		const lastEvent = findMostRecentEventInTrack<App.IBasicLightEvent>(lightEvents, currentBeat, processingDelayInBeats);
		return lastEvent;
	});
	const laserSpeed = useAppSelector((state) => {
		if (!song) {
			return 0;
		}

		const tracks = getTracks(state);

		const speedTrackId = side === "left" ? App.TrackId[12] : App.TrackId[13];

		const speedEvents = tracks[speedTrackId];

		const currentBeat = getCursorPositionInBeats(state);
		if (!currentBeat) return 0;
		const processingDelay = getUsableProcessingDelay(state);

		const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);

		const lastSpeedEvent = findMostRecentEventInTrack<App.IBasicValueEvent>(speedEvents, currentBeat, processingDelayInBeats);

		const laserSpeed = lastSpeedEvent ? lastSpeedEvent.laserSpeed : 0;
		return laserSpeed;
	});
	const secondsSinceSongStart = useAppSelector((state) => getCursorPosition(state) / 1000);

	const NUM_OF_HORIZONTAL_BEAMS = 4;
	const laserIndices = range(0, NUM_OF_HORIZONTAL_BEAMS);

	const zDistanceBetweenBeams = -20;
	const xDistanceBetweenBeams = side === "left" ? -2 : 2;

	// We want the two sides to be threaded through each other, so the left side
	// should be inset by 50% of the distance between beams
	const zLeftSideOffset = zDistanceBetweenBeams / 2;

	const xOffset = side === "right" ? 40 : -40;
	const yOffset = -10;
	const zOffset = side === "right" ? -100 : -100 - zLeftSideOffset;

	const status = lastEvent ? lastEvent.type : App.BasicEventType.OFF;
	const eventId = lastEvent ? lastEvent.id : null;

	const color = status === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastEvent?.colorType, song);

	const horizontalBeams = laserIndices.map((index) => {
		const position: Vector3Tuple = [xOffset + index * xDistanceBetweenBeams, yOffset, zOffset + index * zDistanceBetweenBeams];

		const rotation: Vector3Tuple = [
			0, // TODO: Rotate this slightly too?
			0,
			convertDegreesToRadians(getSinRotationValue(side, index, secondsSinceSongStart, laserSpeed)),
		];

		return <LaserBeam key={index} color={color} position={position} rotation={rotation} lastEventId={eventId} status={status} isPlaying={isPlaying} />;
	});

	// Side lasers also feature a single "perspective" beam, shooting into the
	// distance.
	const perspectiveBeam = <LaserBeam color={color} position={[xOffset * 1.5, yOffset, -45]} rotation={[convertDegreesToRadians(90), 0, 0]} lastEventId={eventId} status={status} isPlaying={isPlaying} />;

	return (
		<Fragment>
			{horizontalBeams}
			{perspectiveBeam}
		</Fragment>
	);
};

export default SideLaser;
