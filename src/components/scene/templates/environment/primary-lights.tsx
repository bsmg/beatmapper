import { Fragment } from "react";

import { SURFACE_WIDTH } from "$/components/scene/constants";
import { useLightEffect } from "$/components/scene/hooks/environment.hooks";
import { useBasicEventTrack, useBoostEventTrack } from "$/components/scene/hooks/use-event-track";
import { Environment } from "$/components/scene/layouts";

const SIDE_BEAM_LENGTH = 250;

function PrimaryLights() {
	const [lastLightEvent, nextLightEvent] = useBasicEventTrack({ trackId: 4 });
	const [lastBoostEvent] = useBoostEventTrack();

	const light = useLightEffect({ lastEvent: lastLightEvent, nextEvent: nextLightEvent, lastBoostEvent });

	return (
		<Fragment>
			<Environment.Chevron light={light} position-y={5} position-z={-85} />
			{/* Side parallel-to-platform lasers */}
			<Environment.TubeLight light={light} radius={0.05} position={[SURFACE_WIDTH - 2, -2, -SIDE_BEAM_LENGTH / 2 - 5]} rotation-x={Math.PI / 2} length={SIDE_BEAM_LENGTH} />
			<Environment.TubeLight light={light} radius={0.05} position={[-SURFACE_WIDTH + 2, -2, -SIDE_BEAM_LENGTH / 2 - 5]} rotation-x={Math.PI / 2} length={SIDE_BEAM_LENGTH} />
			{/* TODO: laser beams for along the side and maybe along the bottom too? */}
		</Fragment>
	);
}

export default PrimaryLights;
