import { animated } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { AdditiveBlending, Color, FrontSide } from "three";

import { glowFragmentShader, glowVertexShader } from "$/assets";
import { useLightSpring } from "$/components/scene/compositions/materials/light";
import type { UseLightPropsReturn } from "$/components/scene/hooks";
import type { SongId } from "$/types";
import { normalize } from "$/utils";

interface Props {
	sid: SongId;
	x: number;
	y: number;
	z: number;
	size: number;
	light: UseLightPropsReturn;
	isBlooming?: boolean;
}
function Glow({ sid, x, y, z, size, light, isBlooming }: Props) {
	const { camera } = useThree();

	const [spring] = useLightSpring({ light });

	// When blooming, the `c` uniform makes it white and obnoxious, so tune the effect down in this case.
	const maxCValue = useMemo(() => (isBlooming ? 0.2 : 0.001), [isBlooming]);

	const PValueRange = useMemo(() => (isBlooming ? [40, 1] : [28, 7]), [isBlooming]);

	return (
		<mesh position={[x, y, z]}>
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
				uniforms-p-value={spring.opacity.to((o) => normalize(o, 0, 1, ...PValueRange))}
				uniforms-c-value={spring.opacity.to((o) => normalize(o, 0, 1, 0.1, maxCValue))}
			/>
		</mesh>
	);
}

export default Glow;
