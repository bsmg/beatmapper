import type { Vector3Tuple } from "three";

import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { getColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { getCursorPositionInBeats, getTracks, getUsableProcessingDelay } from "$/store/selectors";
import { App } from "$/types";
import { range } from "$/utils";
import { findMostRecentEventInTrack } from "./Preview.helpers";

import LaserBeam from "./LaserBeam";

interface Props {
	song: App.Song;
	isPlaying: boolean;
	secondsSinceSongStart?: number;
}

const BackLaser = ({ song, isPlaying }: Props) => {
	const lastEvent = useAppSelector((state) => {
		if (!song) {
			return null;
		}

		const trackId = App.TrackId[0];

		const tracks = getTracks(state);
		const events = tracks[trackId];

		const currentBeat = getCursorPositionInBeats(state);
		if (!currentBeat) return null;
		const processingDelay = getUsableProcessingDelay(state);
		const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);

		const lastEvent = findMostRecentEventInTrack<App.IBasicLightEvent>(events, currentBeat, processingDelayInBeats);

		return lastEvent;
	});

	const NUM_OF_BEAMS_PER_SIDE = 5;
	const laserIndices = range(0, NUM_OF_BEAMS_PER_SIDE);

	const zDistanceBetweenBeams = -25;

	const status = lastEvent ? lastEvent.type : App.BasicEventType.OFF;
	const eventId = lastEvent ? lastEvent.id : null;
	const color = status === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastEvent?.colorType, song);

	const sides = ["left", "right"];

	return sides.map((side) => {
		const xOffset = 0;
		const zOffset = -140;

		return laserIndices.map((index) => {
			const position: Vector3Tuple = [xOffset, -40, zOffset + index * zDistanceBetweenBeams];

			const rotation: Vector3Tuple = [0, 0, side === "right" ? -0.45 : 0.45];

			return <LaserBeam key={`${side}-${index}`} color={color} position={position} rotation={rotation} lastEventId={eventId} status={status} isPlaying={isPlaying} />;
		});
	});
};

export default BackLaser;
