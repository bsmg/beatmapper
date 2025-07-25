import { Fragment } from "react";

import { SURFACE_WIDTH } from "$/components/scene/constants";
import { useEventTrack, useLightProps } from "$/components/scene/hooks";
import type { BeatmapId, SongId } from "$/types";
import { convertDegreesToRadians } from "$/utils";

import { TubeLight } from "$/components/scene/compositions/environment";
import { LightMaterial } from "$/components/scene/compositions/materials";

const Y_POSITION = 5;
const Z_POSITION = -85;

const CHEVRON_SIDE_LENGTH = 5;
const CHEVRON_THICKNESS = 0.5;
const CHEVRON_X_OFFSET = CHEVRON_SIDE_LENGTH / 2 - CHEVRON_THICKNESS * 1.25;
const CHEVRON_ANGLE = Math.PI * 0.2;

const SIDE_BEAM_LENGTH = 250;

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function PrimaryLights({ sid, bid }: Props) {
	const [lastEvent] = useEventTrack({ sid, trackId: 4 });

	const light = useLightProps({ sid, bid, lastEvent });

	return (
		<Fragment>
			<group position-y={Y_POSITION} position-z={Z_POSITION}>
				<mesh position-x={CHEVRON_X_OFFSET} position-y={CHEVRON_THICKNESS / 2} rotation-z={-CHEVRON_ANGLE}>
					<boxGeometry attach="geometry" args={[CHEVRON_SIDE_LENGTH, CHEVRON_THICKNESS, CHEVRON_THICKNESS]} />
					<LightMaterial light={light} />
				</mesh>
				<mesh position-x={-CHEVRON_X_OFFSET} position-y={CHEVRON_THICKNESS / 2} rotation-z={CHEVRON_ANGLE}>
					<boxGeometry attach="geometry" args={[CHEVRON_SIDE_LENGTH, CHEVRON_THICKNESS, CHEVRON_THICKNESS]} />
					<LightMaterial light={light} />
				</mesh>
			</group>
			{/* Side parallel-to-platform lasers */}
			<TubeLight radius={0.05} light={light} position={[SURFACE_WIDTH - 2, -2, -SIDE_BEAM_LENGTH / 2 - 5]} rotation={[convertDegreesToRadians(90), 0, 0]} length={SIDE_BEAM_LENGTH} />
			<TubeLight radius={0.05} light={light} position={[-SURFACE_WIDTH + 2, -2, -SIDE_BEAM_LENGTH / 2 - 5]} rotation={[convertDegreesToRadians(90), 0, 0]} length={SIDE_BEAM_LENGTH} />
			{/* TODO: laser beams for along the side and maybe along the bottom too? */}
		</Fragment>
	);
}

export default PrimaryLights;
