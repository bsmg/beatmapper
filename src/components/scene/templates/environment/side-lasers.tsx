import { Fragment, useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectCursorPosition } from "$/store/selectors";
import { App, type BeatmapId, type SongId } from "$/types";
import { convertDegreesToRadians, normalize, range } from "$/utils";

import { TubeLight } from "$/components/scene/compositions/environment";
import { useEventTrack, useLightProps } from "$/components/scene/hooks";

const NUM_OF_HORIZONTAL_BEAMS = 4;
const X_OFFSET = 40;
const Y_OFFSET = -10;
const Z_OFFSET = -100;
const X_DISTANCE_BETWEEN_BEAMS = 2;
const Z_DISTANCE_BETWEEN_BEAMS = 20;

const laserIndices = range(0, NUM_OF_HORIZONTAL_BEAMS);

function scaleToSeconds(x: number) {
	return x / 1000;
}

// We want to use a sin curve to control laser rotation.
// Math.sin produces a value between -1 and 1, and resets after 2PI, which means if we use the number of seconds since the start of the song, it will complete 1 full rotation every 6.28 seconds.
// I haven't taken the time to work out what the actual speed in-game is, but by approximating,
// it looks like Laser Speed 1 takes about 30 seconds to complete a cycle, whereas Laser Speed 8 (fastest) takes about 6 seconds.
function getSinRotationValue(side: "left" | "right", beamIndex: number, time: number, laserSpeed: number) {
	const defaultRotation = side === "left" ? -55 : 55;

	if (laserSpeed === 0) {
		return defaultRotation;
	}

	// I don't want every beam to sit at exactly the same spot in the sin cycle.
	// In the game, the first 2 lasers follow each other closely, while the remaining ones swivel at seemingly random offsets.
	let beamIndexOffset: number;
	if (beamIndex === 0) {
		beamIndexOffset = 0;
	} else if (beamIndex === 1) {
		beamIndexOffset = 0.1;
	} else {
		beamIndexOffset = beamIndex;
	}

	const sinValue = Math.sin(time * laserSpeed * 0.35 + beamIndexOffset);

	return normalize(sinValue, -1, 1, defaultRotation, defaultRotation * -1);
}

interface Props {
	sid: SongId;
	bid: BeatmapId;
	side: "left" | "right";
	timescale?: (cursorPosition: number) => number;
}
function SideLasers({ sid, bid, side, timescale = scaleToSeconds }: Props) {
	const cursorPosition = useAppSelector(selectCursorPosition);

	const [lastLightEvent] = useEventTrack({ sid, trackId: side === "left" ? App.TrackId[2] : App.TrackId[3] });
	const [lastSpeedEvent] = useEventTrack({ sid, trackId: side === "left" ? App.TrackId[12] : App.TrackId[13] });

	const light = useLightProps({ sid, bid, lastEvent: lastLightEvent });

	const laserSpeed = useMemo(() => {
		if (!lastSpeedEvent) return 0;
		return lastSpeedEvent.value;
	}, [lastSpeedEvent]);

	const secondsSinceSongStart = useMemo(() => timescale(cursorPosition), [timescale, cursorPosition]);
	const factor = useMemo(() => (side === "left" ? -1 : 1), [side]);

	const xDistanceBetweenBeams = useMemo(() => X_DISTANCE_BETWEEN_BEAMS * factor, [factor]);
	const xOffset = useMemo(() => X_OFFSET * factor, [factor]);

	const horizontalBeams = laserIndices.map((index) => {
		const xPosition = xOffset + index * xDistanceBetweenBeams;
		const zPosition = Z_OFFSET + index * -Z_DISTANCE_BETWEEN_BEAMS;
		const zRotation = convertDegreesToRadians(getSinRotationValue(side, index, secondsSinceSongStart, laserSpeed));
		return <TubeLight key={index} light={light} radius={0.2} position-x={xPosition} position-y={Y_OFFSET} position-z={zPosition} rotation-z={zRotation} />;
	});
	// Side lasers also feature a single "perspective" beam, shooting into the distance.
	const perspectiveBeam = <TubeLight light={light} radius={0.15} position={[xOffset * 1.5, Y_OFFSET, -45]} rotation={[convertDegreesToRadians(90), 0, 0]} />;

	return (
		<Fragment>
			{horizontalBeams}
			{perspectiveBeam}
		</Fragment>
	);
}

export default SideLasers;
