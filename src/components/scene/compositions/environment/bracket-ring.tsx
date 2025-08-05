import { type AnimatedProps, animated } from "@react-spring/three";
import type { Euler } from "@react-three/fiber";
import { useMemo } from "react";
import type { ColorRepresentation } from "three";

import type { GroupProps } from "$/types/vendor";

interface ModelProps {
	side?: "top" | "bottom";
	size: number;
	thickness: number;
	color: ColorRepresentation;
}
function RingHalf({ side, size, thickness, color }: ModelProps) {
	const length = useMemo(() => size, [size]);
	const height = useMemo(() => length * 0.25, [length]);

	// If this is the bottom half, we need to rotate the whole thing 180deg.
	const rotation = useMemo(() => [0, 0, side === "bottom" ? Math.PI : 0] as Euler, [side]);

	return (
		<group rotation={rotation}>
			{/* Long beam */}
			<mesh position={[0, length / 2, 0]}>
				<boxGeometry attach="geometry" args={[length, thickness, thickness]} />
				<meshLambertMaterial attach="material" color={color} />
			</mesh>
			{/* Stubby legs */}
			<mesh position={[-length / 2 + thickness / 2, length / 2 - height / 2, 0]} rotation={[0, 0, Math.PI * 0.5]}>
				<boxGeometry attach="geometry" args={[height, thickness, thickness]} />
				<meshLambertMaterial attach="material" color={color} />
			</mesh>
			<mesh position={[length / 2 - thickness / 2, length / 2 - height / 2, 0]} rotation={[0, 0, Math.PI * 0.5]}>
				<boxGeometry attach="geometry" args={[height, thickness, thickness]} />
				<meshLambertMaterial attach="material" color={color} />
			</mesh>
		</group>
	);
}

interface Props extends AnimatedProps<GroupProps> {
	size?: number;
	thickness: number;
	color: ColorRepresentation;
}
function BracketRing({ size = 12, thickness, color, ...rest }: Props) {
	// Each ring consists of 2 identical-but-mirrored pieces, each the shape of an unused staple: [ ]
	return (
		<animated.group {...rest}>
			<RingHalf size={size} thickness={thickness} color={color} />
			<RingHalf side="bottom" size={size} thickness={thickness} color={color} />
		</animated.group>
	);
}

export default BracketRing;
