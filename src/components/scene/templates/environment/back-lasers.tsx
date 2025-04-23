import type { Vector3Tuple } from "three";

import { App, type SongId } from "$/types";
import { range } from "$/utils";

import { TubeLight } from "$/components/scene/compositions/environment";
import { useEventTrack, useLightProps } from "$/components/scene/hooks";

const sides = ["left", "right"];

const NUM_OF_BEAMS_PER_SIDE = 5;
const DISTANCE_BETWEEN_BEAMS = 25;

const INDICES = range(0, NUM_OF_BEAMS_PER_SIDE);

interface Props {
	sid: SongId;
	secondsSinceSongStart?: number;
}
function BackLasers({ sid }: Props) {
	const lastEvent = useEventTrack<App.IBasicLightEvent>({ sid, trackId: App.TrackId[0] });

	const { lastEventId: eventId, status, color } = useLightProps({ sid, lastEvent });

	return sides.map((side) => {
		const xOffset = 0;
		const zOffset = -140;
		return INDICES.map((index) => {
			const position: Vector3Tuple = [xOffset, -40, zOffset + index * -DISTANCE_BETWEEN_BEAMS];
			const rotation: Vector3Tuple = [0, 0, side === "right" ? -0.45 : 0.45];
			return <TubeLight key={`${side}-${index}`} radius={0.25} color={color} position={position} rotation={rotation} lastEventId={eventId} status={status} />;
		});
	});
}

export default BackLasers;
