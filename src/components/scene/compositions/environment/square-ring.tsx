import { animated } from "@react-spring/three";
import { type ComponentProps, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { LightMaterial } from "$/components/scene/compositions/materials";
import type { UseLightPropsReturn } from "$/components/scene/hooks";

interface ModelProps {
	size: number;
	thickness: number;
	color: ColorRepresentation;
	zRotation: number;
	light: UseLightPropsReturn;
}
function RingPeg({ size, thickness, color, zRotation, light }: ModelProps) {
	const length = useMemo(() => size, [size]);
	const width = useMemo(() => thickness * 1.5, [thickness]);

	return (
		<group rotation={[0, 0, zRotation]}>
			<mesh position={[0, length / 2 - width / 2, 0]}>
				<boxGeometry attach="geometry" args={[length, width, thickness]} />
				<meshLambertMaterial attach="material" color={color} />
			</mesh>
			<mesh position={[0, length / 2 - width / 2 - thickness - 0.1, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
				<planeGeometry attach="geometry" args={[length * 0.125, thickness * 0.375]} />
				<LightMaterial light={light} />
			</mesh>
		</group>
	);
}

// Each ring consists of 4 identical pegs, long thick bars with a light pointing inwards. They're each rotated 90deg to form a square.
const zRotations = [0, Math.PI * 0.5, Math.PI * 1, Math.PI * 1.5];

interface Props extends ComponentProps<typeof animated.group> {
	size?: number;
	thickness: number;
	color: ColorRepresentation;
	light: UseLightPropsReturn;
}
function LitSquareRing({ size = 12, thickness, color, light, ...rest }: Props) {
	return (
		<animated.group {...rest}>
			{zRotations.map((zRotation) => (
				<RingPeg key={zRotation} size={size} thickness={thickness} color={color} zRotation={zRotation} light={light} />
			))}
		</animated.group>
	);
}

export default LitSquareRing;
