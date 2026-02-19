import type { Assign } from "@ark-ui/react";
import { animated } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { type ComponentProps, useMemo } from "react";
import { AdditiveBlending, Color, FrontSide } from "three";

import { glowFragmentShader, glowVertexShader } from "$/assets";
import { type UseLightSpringOptions, useLightSpring } from "$/components/scene/hooks/use-light-spring";
import { normalize } from "$/utils";

interface Props {
	size: number;
	bloom?: boolean;
}
function Glow({ size, bloom, light, ...rest }: Assign<ComponentProps<"mesh">, Props & UseLightSpringOptions>) {
	const { camera } = useThree();

	const [lightSpring] = useLightSpring({ light });

	// When blooming, the `c` uniform makes it white and obnoxious, so tune the effect down in this case.
	const maxCValue = useMemo(() => (bloom ? 0.2 : 0.001), [bloom]);
	const PValueRange = useMemo(() => (bloom ? [40, 1] : [28, 7]), [bloom]);

	return (
		<mesh {...rest}>
			<sphereGeometry attach="geometry" args={[size, 32, 16]} />
			<animated.shaderMaterial
				attach="material"
				args={[
					{
						uniforms: {
							c: { value: maxCValue },
							p: { value: undefined },
							glowColor: { value: new Color(light.color) },
							viewVector: { value: camera.position },
						},
						vertexShader: glowVertexShader,
						fragmentShader: glowFragmentShader,
						side: FrontSide,
						blending: AdditiveBlending,
						transparent: true,
					},
				]}
				uniforms-glowColor-value={new Color(light.color)}
				uniforms-p-value={lightSpring.opacity.to((o) => normalize(o, 0, 1, ...PValueRange))}
				uniforms-c-value={lightSpring.opacity.to((o) => normalize(o, 0, 1, 0.1, maxCValue))}
			/>
		</mesh>
	);
}

export default Glow;
