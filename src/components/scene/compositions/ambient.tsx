import { Fragment } from "react";
import type { Vector3Tuple } from "three";

import { SONG_OFFSET } from "$/components/scene/constants";

const frontLightTarget: Vector3Tuple = [0, 0, SONG_OFFSET];
const midLightTarget: Vector3Tuple = [0, -20, -20];

export function AmbientLight() {
	return (
		<Fragment>
			<directionalLight castShadow intensity={0.6} position={[0, 30, SONG_OFFSET]}>
				<object3D attach="target" position={frontLightTarget} />
			</directionalLight>
			<directionalLight intensity={0.25} position={[0, 0, 20]} />
			<directionalLight intensity={0.5} position={[50, 50, SONG_OFFSET - 30]}>
				<object3D attach="target" position={midLightTarget} />
			</directionalLight>
			<directionalLight intensity={0.5} position={[-50, 50, SONG_OFFSET - 30]}>
				<object3D attach="target" position={midLightTarget} />
			</directionalLight>
			<ambientLight intensity={3} />
		</Fragment>
	);
}
