import type { Vector3Tuple } from "three";

import { useEventTrack, useLightProps } from "$/components/scene/hooks";
import type { BeatmapId, SongId } from "$/types";
import { range } from "$/utils";

import { TubeLight } from "$/components/scene/compositions/environment";

const sides = ["left", "right"];

const NUM_OF_BEAMS_PER_SIDE = 5;
const DISTANCE_BETWEEN_BEAMS = 25;

const INDICES = range(0, NUM_OF_BEAMS_PER_SIDE);

interface Props {
	sid: SongId;
	bid: BeatmapId;
	secondsSinceSongStart?: number;
}
function BackLasers({ sid, bid }: Props) {
	const [lastEvent] = useEventTrack({ sid, trackId: 0 });

	const light = useLightProps({ sid, bid, lastEvent });

	return sides.map((side) => {
		const xOffset = 0;
		const zOffset = -140;
		return INDICES.map((index) => {
			const position: Vector3Tuple = [xOffset, -40, zOffset + index * -DISTANCE_BETWEEN_BEAMS];
			const rotation: Vector3Tuple = [0, 0, side === "right" ? -0.45 : 0.45];
			return <TubeLight key={`${side}-${index}`} light={light} radius={0.25} position={position} rotation={rotation} />;
		});
	});
}

export default BackLasers;
