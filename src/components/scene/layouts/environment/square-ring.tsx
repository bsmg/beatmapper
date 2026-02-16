import type { Assign } from "@ark-ui/react";
import { animated } from "@react-spring/three";
import { type ComponentProps, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { type UseLightSpringOptions, useLightSpring } from "$/components/scene/hooks/use-light-spring";
import { range } from "$/utils";

interface Props {
	size?: number;
	thickness: number;
	color: ColorRepresentation;
}

function RingPeg({ size = 12, thickness, color, light, ...rest }: Assign<ComponentProps<"group">, Props & UseLightSpringOptions>) {
	const length = useMemo(() => size, [size]);
	const width = useMemo(() => thickness * 1.5, [thickness]);

	const [lightSpring, lightProps] = useLightSpring({ light });

	return (
		<group {...rest}>
			<mesh position={[0, length / 2 - width / 2, 0]}>
				<boxGeometry attach="geometry" args={[length, width, thickness]} />
				<meshLambertMaterial attach="material" color={color} />
			</mesh>
			<mesh position={[0, length / 2 - width / 2 - thickness - 0.1, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
				<planeGeometry attach="geometry" args={[length * 0.125, thickness * 0.375]} />
				<animated.meshLambertMaterial attach="material" {...lightSpring} {...lightProps} />
			</mesh>
		</group>
	);
}

function LitSquareRing({ size, thickness, color, light, ...rest }: Assign<ComponentProps<typeof animated.group>, Props & UseLightSpringOptions>) {
	// Each ring consists of 4 identical pegs, long thick bars with a light pointing inwards. They're each rotated 90deg to form a square.
	const segments = useMemo(() => Array.from(range(4), (x) => (Math.PI * x) / 2), []);

	return (
		<animated.group {...rest}>
			{segments.map((zRotation) => (
				<RingPeg key={zRotation} size={size} thickness={thickness} color={color} rotation-z={zRotation} light={light} />
			))}
		</animated.group>
	);
}

export default LitSquareRing;
