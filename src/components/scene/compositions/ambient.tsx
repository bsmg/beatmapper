import { Fragment, useRef } from "react";
import type { Object3D } from "three";

import { SONG_OFFSET } from "$/components/scene/constants";

export function AmbientLight() {
	const frontLightTarget = useRef<Object3D>(null);
	const midLightTarget = useRef<Object3D>(null);

	return (
		<Fragment>
			<object3D ref={midLightTarget} position={[0, 0, SONG_OFFSET]} />
			<object3D ref={frontLightTarget} position={[0, -20, -20]} />
			{/* Bright lights on the placement grid */}
			<directionalLight intensity={0.25} position={[0, 0, 20]} />
			{frontLightTarget.current && <directionalLight castShadow intensity={0.6} position={[0, 30, SONG_OFFSET]} target={frontLightTarget.current} />}
			{midLightTarget.current && <directionalLight intensity={0.5} position={[50, 50, SONG_OFFSET - 30]} target={midLightTarget.current} />}
			<ambientLight intensity={3} />
		</Fragment>
	);
}
