import { Fragment, useMemo } from "react";

import { useLightEffect } from "$/components/scene/hooks/environment.hooks";
import { useBasicEventTrack, useBoostEventTrack } from "$/components/scene/hooks/use-event-track";
import { Environment } from "$/components/scene/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectCursorPosition } from "$/store/selectors";
import { convertDegreesToRadians, mulberry32, normalize, range } from "$/utils";

const NUM_OF_HORIZONTAL_BEAMS = 4;
const X_OFFSET = 40;
const Y_OFFSET = -10;
const Z_OFFSET = -100;
const X_DISTANCE_BETWEEN_BEAMS = 2;
const Z_DISTANCE_BETWEEN_BEAMS = 20;

const laserIndices = Array.from(range(0, NUM_OF_HORIZONTAL_BEAMS));

// We want to use a sin curve to control laser rotation.
// Math.sin produces a value between -1 and 1, and resets after 2PI, which means if we use the number of seconds since the start of the song, it will complete 1 full rotation every 6.28 seconds.
// I haven't taken the time to work out what the actual speed in-game is, but by approximating,
// it looks like Laser Speed 1 takes about 30 seconds to complete a cycle, whereas Laser Speed 8 (fastest) takes about 6 seconds.

function resolveLaserRotation(side: "left" | "right", beamIndex: number, currentTime: number, laserSpeed: number, eventTime: number) {
	const defaultRotation = side === "left" ? -55 : 55;
	if (laserSpeed === 0) return defaultRotation;
	// seed rotations based on event time so that same values produce different orbits
	const random = mulberry32(eventTime);

	let randomOffset = 0;
	for (let i = 0; i <= beamIndex; i++) {
		randomOffset = random() * Math.PI * 2;
	}

	const angle = currentTime * laserSpeed * 0.35 + randomOffset;
	return normalize(Math.sin(angle), -1, 1, defaultRotation, defaultRotation * -1);
}

interface Props {
	side: "left" | "right";
}
function SideLasers({ side }: Props) {
	const cursorPosition = useAppSelector(selectCursorPosition);

	const [lastLightEvent, nextLightEvent] = useBasicEventTrack({ trackId: side === "left" ? 2 : 3 });
	const [lastSpeedEvent] = useBasicEventTrack({ trackId: side === "left" ? 12 : 13 });
	const [lastBoostEvent] = useBoostEventTrack();

	const light = useLightEffect({ lastEvent: lastLightEvent, nextEvent: nextLightEvent, lastBoostEvent });

	const factor = useMemo(() => (side === "left" ? -1 : 1), [side]);

	const xDistanceBetweenBeams = useMemo(() => X_DISTANCE_BETWEEN_BEAMS * factor, [factor]);
	const xOffset = useMemo(() => X_OFFSET * factor, [factor]);

	const horizontalBeams = laserIndices.map((index) => {
		const xPosition = xOffset + index * xDistanceBetweenBeams;
		const zPosition = Z_OFFSET + index * -Z_DISTANCE_BETWEEN_BEAMS;
		const zRotation = convertDegreesToRadians(resolveLaserRotation(side, index, cursorPosition, lastSpeedEvent?.value ?? 0, lastSpeedEvent?.time ?? 0));
		return <Environment.TubeLight key={index} light={light} radius={0.2} position-x={xPosition} position-y={Y_OFFSET} position-z={zPosition} rotation-z={zRotation} />;
	});
	// Side lasers also feature a single "perspective" beam, shooting into the distance.
	const perspectiveBeam = <Environment.TubeLight light={light} radius={0.15} position={[xOffset * 1.5, Y_OFFSET, -45]} rotation={[convertDegreesToRadians(90), 0, 0]} />;

	return (
		<Fragment>
			{horizontalBeams}
			{perspectiveBeam}
		</Fragment>
	);
}

export default SideLasers;
