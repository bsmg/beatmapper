import { useFrame, useThree } from "@react-three/fiber";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { type PropsWithChildren, useEffect, useRef } from "react";
import { HalfFloatType, type Scene } from "three";

export function Bloom({ children }: PropsWithChildren) {
	const { gl, camera, size } = useThree();

	const scene = useRef<Scene>(null);
	const composer = useRef<EffectComposer>();

	useEffect(() => {
		if (!scene.current) return;

		composer.current = new EffectComposer(gl, {
			frameBufferType: HalfFloatType,
		});

		const renderPass = new RenderPass(scene.current, camera);
		composer.current.addPass(renderPass);

		const bloomEffect = new BloomEffect({
			mipmapBlur: true,
			luminanceThreshold: 0,
			intensity: 4.0,
			radius: 0.75,
		});
		const effectPass = new EffectPass(camera, bloomEffect);
		composer.current.addPass(effectPass);

		void composer.current.setSize(size.width, size.height);
	}, [size, camera, gl]);

	useFrame((_, delta) => {
		if (!scene.current || !composer.current) return;
		composer.current.render(delta);
		gl.autoClear = false;
		gl.clearDepth();
		gl.render(scene.current, camera);
	});

	return <scene ref={scene}>{children}</scene>;
}
