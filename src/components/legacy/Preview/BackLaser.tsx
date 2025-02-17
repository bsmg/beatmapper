import type { Vector3Tuple } from "three";

import { getColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllBasicEventsForTrack, selectCursorPositionInBeats, selectCustomColors, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";
import { App } from "$/types";
import { range } from "$/utils";
import { findMostRecentEventInTrack } from "./Preview.helpers";

import LaserBeam from "./LaserBeam";

interface Props {
	isPlaying: boolean;
	secondsSinceSongStart?: number;
}

const BackLaser = ({ isPlaying }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, songId));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, songId));

	const lastEvent = useAppSelector((state) => {
		if (!songId || !currentBeat) return null;
		const events = selectAllBasicEventsForTrack(state, App.TrackId[0]);
		const lastEvent = findMostRecentEventInTrack<App.IBasicLightEvent>(events, currentBeat, processingDelayInBeats);
		return lastEvent;
	});

	const NUM_OF_BEAMS_PER_SIDE = 5;
	const laserIndices = range(0, NUM_OF_BEAMS_PER_SIDE);

	const zDistanceBetweenBeams = -25;

	const status = lastEvent ? lastEvent.type : App.BasicEventType.OFF;
	const eventId = lastEvent ? lastEvent.id : null;
	const color = status === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastEvent?.colorType, customColors);

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
