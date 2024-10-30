import { useFrame, useThree } from "@react-three/fiber";
import { type PropsWithChildren, useEffect, useRef } from "react";
import { type Scene, Vector2 } from "three";
import { EffectComposer, RenderPass, UnrealBloomPass } from "three-stdlib";

interface Props extends PropsWithChildren {}

export function Bloom({ children }: Props) {
	const { gl, camera, size } = useThree();
	const scene = useRef<Scene>(null);
	const composer = useRef<EffectComposer>();

	useEffect(() => {
		if (!scene.current) return;
		composer.current = new EffectComposer(gl);
		composer.current.addPass(new RenderPass(scene.current, camera));
		const bloomPass = new UnrealBloomPass(new Vector2(size.width, size.height), 1.5, 0.4, 0.85);

		gl.toneMappingExposure = 1;
		bloomPass.threshold = 0;
		bloomPass.strength = 4;
		bloomPass.radius = 0.75;

		composer.current.addPass(bloomPass);
	}, [camera, size.height, size.width, gl]);

	useEffect(() => {
		if (!composer.current) return;
		void composer.current.setSize(size.width, size.height);
	}, [size]);

	useFrame(() => {
		if (!composer.current) return;
		composer.current.render();
		// gl.autoClear = false;
		// gl.clearDepth();
		// gl.render(scene.current, camera);
	});
	return <scene ref={scene}>{children}</scene>;
}

export function NoBloom({ children }: Props) {
	const scene = useRef<Scene>(null);
	const { gl, camera } = useThree();
	useFrame(() => {
		if (!scene.current) return;
		gl.autoClear = false;
		gl.clearDepth();
		gl.render(scene.current, camera);
	});
	return <scene ref={scene}>{children}</scene>;
}

export default Bloom;
