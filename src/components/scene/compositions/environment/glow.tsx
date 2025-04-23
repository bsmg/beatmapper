import { animated } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, type ColorRepresentation, FrontSide } from "three";

import { glowFragmentShader, glowVertexShader } from "$/assets";
import { useLightSpring } from "$/components/scene/compositions/materials/light";
import type { App } from "$/types";
import { normalize } from "$/utils";
import { useMemo } from "react";

interface Props {
	x: number;
	y: number;
	z: number;
	color: ColorRepresentation;
	size: number;
	status: App.LightEventType;
	lastEventId: App.BasicEvent["id"] | null;
	isBlooming?: boolean;
}
function Glow({ x, y, z, color, size, status, lastEventId, isBlooming }: Props) {
	const { camera } = useThree();

	const [spring] = useLightSpring({ lastEventId, status, color });

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
							glowColor: { value: new Color(color) },
							viewVector: { value: camera.position },
						},
						vertexShader: glowVertexShader,
						fragmentShader: glowFragmentShader,
						side: FrontSide,
						blending: AdditiveBlending,
						transparent: true,
					},
				]}
				uniforms-glowColor-value={new Color(color)}
				uniforms-p-value={spring.opacity.to((o) => normalize(o, 0, 1, ...PValueRange))}
				uniforms-c-value={spring.opacity.to((o) => normalize(o, 0, 1, 0.1, maxCValue))}
			/>
		</mesh>
	);
}

export default Glow;
