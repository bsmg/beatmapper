import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { Controls } from "$/services/controls.service";

export function useControls() {
	const controls = useRef<Controls | null>(null);

	// Controls to move around the space.
	useFrame(({ scene, camera }) => {
		if (!controls.current) {
			controls.current = new Controls(camera);
			scene.add(controls.current.getObject());
		} else {
			controls.current.update();
		}
	});
}
