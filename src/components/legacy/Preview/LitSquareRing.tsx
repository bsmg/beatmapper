import { type Interpolation, animated, useSpring } from "@react-spring/three";
import { type ColorRepresentation, DoubleSide, type Vector3Tuple } from "three";

import { useOnChange } from "$/hooks";
import { App } from "$/types";
import { getSpringConfigForLight } from "./Preview.helpers";

const ON_PROPS = { emissiveIntensity: 0.5, opacity: 0.75 };
const OFF_PROPS = { emissiveIntensity: 0, opacity: 0 };
const BRIGHT_PROPS = { emissiveIntensity: 1, opacity: 1 };

interface ModelProps {
	size: number;
	thickness: number;
	color: ColorRepresentation;
	zRotation: number;
	lightStatus: App.LightEventType;
	lightColor: App.EventColor;
	lastLightingEventId: App.BasicEvent["id"] | null;
	isPlaying: boolean;
}

const RingPeg = ({ size, thickness, color, zRotation, lightStatus, lightColor, lastLightingEventId, isPlaying }: ModelProps) => {
	const length = size;
	const width = thickness * 1.5;

	const lightSpringConfig = getSpringConfigForLight([ON_PROPS, OFF_PROPS, BRIGHT_PROPS], lightStatus);

	useOnChange(() => {
		if (!isPlaying) {
			return;
		}

		const statusShouldReset = lightStatus === App.BasicEventType.FLASH || lightStatus === App.BasicEventType.FADE;

		lightSpringConfig.reset = statusShouldReset;
	}, lastLightingEventId);

	const lightingSpring = useSpring(lightSpringConfig);

	return (
		<group rotation={[0, 0, zRotation]}>
			<mesh position={[0, length / 2 - width / 2, 0]}>
				<boxGeometry attach="geometry" args={[length, width, thickness]} />
				<meshLambertMaterial attach="material" color={color} />
			</mesh>

			<mesh position={[0, length / 2 - width / 2 - thickness - 0.1, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
				<planeGeometry attach="geometry" args={[length * 0.3, thickness * 0.25]} />
				<animated.meshLambertMaterial attach="material" emissive={lightColor} transparent={true} side={DoubleSide} {...lightingSpring} />
			</mesh>
		</group>
	);
};

interface Props {
	index: number;
	size?: number;
	thickness: number;
	x?: number;
	y?: number;
	z?: number;
	color: ColorRepresentation;
	rotation: Vector3Tuple | Interpolation<Vector3Tuple>;
	lightStatus: App.LightEventType;
	lightColor: App.EventColor;
	lastLightingEventId: App.BasicEvent["id"] | null;
	isPlaying: boolean;
}

const LitSquareRing = ({ size = 12, thickness, x = 0, y = -2, z = -8, color, rotation, lightStatus, lightColor, lastLightingEventId, isPlaying }: Props) => {
	// Each ring consists of 4 identical pegs, long thick bars with a light pointing inwards. They're each rotated 90deg to form a square.
	const zRotations = [0, Math.PI * 0.5, Math.PI * 1, Math.PI * 1.5];

	return (
		<animated.group position={[x, y, z]} rotation={rotation}>
			{zRotations.map((zRotation) => (
				<RingPeg key={zRotation} size={size} thickness={thickness} color={color} zRotation={zRotation} lightStatus={lightStatus} lightColor={lightColor} lastLightingEventId={lastLightingEventId} isPlaying={isPlaying} />
			))}
		</animated.group>
	);
};

export default LitSquareRing;
