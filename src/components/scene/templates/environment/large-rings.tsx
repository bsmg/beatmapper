import { LitSquareRing } from "$/components/scene/compositions/environment";
import { useEventTrack, useLightProps, useRingCount } from "$/components/scene/hooks";
import { Environment } from "$/components/scene/layouts";
import type { BeatmapId, SongId } from "$/types";

const INITIAL_ROTATION = Math.PI * 0.25;
const DISTANCE_BETWEEN_RINGS = 18;
const FIRST_RING_OFFSET = -60;

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function LargeRings({ sid, bid }: Props) {
	const [lastLightEvent] = useEventTrack({ sid, trackId: 1 });
	const [lastRotationEvent] = useEventTrack({ sid, trackId: 8 });

	const light = useLightProps({ sid, bid, lastEvent: lastLightEvent });

	const numOfRings = useRingCount({ count: 16 });

	return (
		<Environment.Rings count={numOfRings} lastRotationEvent={lastRotationEvent} lastZoomEvent={null} minDistance={DISTANCE_BETWEEN_RINGS} position-y={-2} position-z={FIRST_RING_OFFSET} rotation-z={INITIAL_ROTATION}>
			{(index, { zPosition, zRotation }) => <LitSquareRing key={index} size={128} thickness={2.5} color="#171717" position-z={zPosition} rotation-z={zRotation} light={light} />}
		</Environment.Rings>
	);
}

export default LargeRings;
