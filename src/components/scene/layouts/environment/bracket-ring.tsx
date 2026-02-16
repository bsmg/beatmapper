import type { Assign } from "@ark-ui/react";
import { animated } from "@react-spring/three";
import { type ComponentProps, useMemo } from "react";
import type { ColorRepresentation } from "three";

interface Props {
	size?: number;
	thickness: number;
	color: ColorRepresentation;
}

function RingHalf({ size = 12, thickness, color, ...rest }: Assign<ComponentProps<"group">, Props>) {
	const length = useMemo(() => size, [size]);
	const height = useMemo(() => length * 0.25, [length]);

	return (
		<group {...rest}>
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

function BracketRing({ size = 12, thickness, color, ...rest }: Assign<ComponentProps<typeof animated.group>, Props>) {
	// Each ring consists of 2 identical-but-mirrored pieces, each the shape of an unused staple: [ ]
	return (
		<animated.group {...rest}>
			<RingHalf size={size} thickness={thickness} color={color} />
			<RingHalf size={size} thickness={thickness} color={color} rotation-z={Math.PI} />
		</animated.group>
	);
}

export default BracketRing;
