import { useRouteContext } from "@tanstack/react-router";

import { useBasicEventTrack } from "$/components/scene/hooks/use-event-track";
import { useRenderScale } from "$/components/scene/hooks/use-render-scale";
import { Environment } from "$/components/scene/layouts";

function SmallRings() {
	const { theme } = useRouteContext({ from: "__root__" });

	const [lastRotationEvent] = useBasicEventTrack({ trackId: 8 });
	const [lastZoomEvent] = useBasicEventTrack({ trackId: 9 });

	const numOfRings = useRenderScale(12);

	return (
		<Environment.Rings count={numOfRings} lastRotationEvent={lastRotationEvent} lastZoomEvent={lastZoomEvent} position-y={-2} position-z={-50} rotation-z={Math.PI * 0.25}>
			{(index, { zPosition, zRotation }) => <Environment.BracketRing key={index} size={32} thickness={1} color={theme === "dark" ? "#1C1C1C" : "#E3E3E3"} position-z={zPosition} rotation-z={zRotation} />}
		</Environment.Rings>
	);
}

export default SmallRings;
