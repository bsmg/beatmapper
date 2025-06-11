import type { SongId } from "$/types";

import { BracketRing } from "$/components/scene/compositions/environment";
import { useEventTrack, useRingCount } from "$/components/scene/hooks";
import { Environment } from "$/components/scene/layouts";

const INITIAL_ROTATION = Math.PI * 0.25;
const FIRST_RING_OFFSET = -50;

interface Props {
	sid: SongId;
}
function SmallRings({ sid }: Props) {
	const [lastRotationEvent] = useEventTrack({ sid, trackId: 8 });
	const [lastZoomEvent] = useEventTrack({ sid, trackId: 9 });

	const numOfRings = useRingCount({ count: 12 });

	return (
		<Environment.Rings count={numOfRings} lastRotationEvent={lastRotationEvent} lastZoomEvent={lastZoomEvent} position-y={-2} position-z={FIRST_RING_OFFSET} rotation-z={INITIAL_ROTATION}>
			{(index, { zPosition, zRotation }) => <BracketRing key={index} size={32} thickness={1} color="#1C1C1C" position-z={zPosition} rotation-z={zRotation} />}
		</Environment.Rings>
	);
}

export default SmallRings;
