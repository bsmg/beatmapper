import { animated, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, type ColorRepresentation, FrontSide } from "three";

import { glowFragmentShader, glowVertexShader } from "$/assets";
import { useOnChange } from "$/hooks";
import { App } from "$/types";
import { normalize } from "$/utils";
import { getSpringConfigForLight } from "./Preview.helpers";

const ON_PROPS = { opacity: 0.75 };
const OFF_PROPS = { opacity: 0 };
const BRIGHT_PROPS = { opacity: 1 };

interface Props {
	x: number;
	y: number;
	z: number;
	color: ColorRepresentation;
	size: number;
	status: App.LightingEventType;
	lastEventId: App.Event["id"] | null;
	isPlaying: boolean;
	isBlooming?: boolean;
}

const Glow = ({ x, y, z, color, size, status, lastEventId, isPlaying, isBlooming }: Props) => {
	const { camera } = useThree();

	const springConfig = getSpringConfigForLight([ON_PROPS, OFF_PROPS, BRIGHT_PROPS], status);

	useOnChange(() => {
		if (!isPlaying) {
			return;
		}
		const statusShouldReset = status === App.EventType.FLASH || status === App.EventType.FADE;

		springConfig.reset = statusShouldReset;
	}, lastEventId);

	const spring = useSpring(springConfig);

	// When blooming, the `c` uniform makes it white and obnoxious, so tune the effect down in this case.
	const maxCValue = isBlooming ? 0.2 : 0.001;

	const PValueRange = isBlooming ? [40, 1] : [28, 7];

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
};

export default Glow;
