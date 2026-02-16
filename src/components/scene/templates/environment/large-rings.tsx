import { useLightEffect } from "$/components/scene/hooks/environment.hooks";
import { useEventTrack } from "$/components/scene/hooks/use-event-track";
import { useRenderScale } from "$/components/scene/hooks/use-render-scale";
import { Environment } from "$/components/scene/layouts";

const INITIAL_ROTATION = Math.PI * 0.25;
const DISTANCE_BETWEEN_RINGS = 18;
const FIRST_RING_OFFSET = -60;

function LargeRings() {
	const [lastLightEvent] = useEventTrack({ trackId: 1 });
	const [lastRotationEvent] = useEventTrack({ trackId: 8 });

	const light = useLightEffect({ lastEvent: lastLightEvent });

	const numOfRings = useRenderScale(16);

	return (
		<Environment.Rings count={numOfRings} lastRotationEvent={lastRotationEvent} lastZoomEvent={null} minDistance={DISTANCE_BETWEEN_RINGS} position-y={-2} position-z={FIRST_RING_OFFSET} rotation-z={INITIAL_ROTATION}>
			{(index, { zPosition, zRotation }) => <Environment.SquareRing key={index} size={128} thickness={2.5} color="#171717" position-z={zPosition} rotation-z={zRotation} light={light} />}
		</Environment.Rings>
	);
}

export default LargeRings;
