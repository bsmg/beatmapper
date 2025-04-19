import { Fragment } from "react";
import { Object3D } from "three";

import { SONG_OFFSET } from "$/constants";

const frontLightTarget = new Object3D();
frontLightTarget.position.set(0, 0, SONG_OFFSET);
const midLightTarget = new Object3D();
midLightTarget.position.set(0, -20, -20);

function AmbientLights() {
	return (
		<Fragment>
			<primitive object={midLightTarget} />
			<primitive object={frontLightTarget} />

			{/* Bright lights on the placement grid */}
			<directionalLight castShadow intensity={0.6} position={[0, 30, SONG_OFFSET]} target={frontLightTarget} />
			<directionalLight intensity={0.25} position={[0, 0, 20]} />

			<directionalLight intensity={0.5} position={[50, 50, SONG_OFFSET - 30]} target={midLightTarget} />
			<directionalLight intensity={0.5} position={[-50, 50, SONG_OFFSET - 30]} target={midLightTarget} />

			<ambientLight intensity={3} />
		</Fragment>
	);
}

export default AmbientLights;
