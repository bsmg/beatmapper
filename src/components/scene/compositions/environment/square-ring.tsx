import { animated } from "@react-spring/three";
import type { ColorRepresentation } from "three";

import { LightMaterial } from "$/components/scene/compositions/materials";
import type { App } from "$/types";
import { type ComponentProps, useMemo } from "react";

interface ModelProps {
	size: number;
	thickness: number;
	color: ColorRepresentation;
	zRotation: number;
	lightStatus: App.LightEventType;
	lightColor: ColorRepresentation;
	lastLightingEventId: App.BasicEvent["id"] | null;
}
function RingPeg({ size, thickness, color, zRotation, lightStatus, lightColor, lastLightingEventId }: ModelProps) {
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
				<LightMaterial lastEventId={lastLightingEventId} status={lightStatus} color={lightColor} />
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
	lightStatus: App.LightEventType;
	lightColor: ColorRepresentation;
	lastLightingEventId: App.BasicEvent["id"] | null;
}
function LitSquareRing({ size = 12, thickness, color, lightStatus, lightColor, lastLightingEventId, ...rest }: Props) {
	return (
		<animated.group {...rest}>
			{zRotations.map((zRotation) => (
				<RingPeg key={zRotation} size={size} thickness={thickness} color={color} zRotation={zRotation} lightStatus={lightStatus} lightColor={lightColor} lastLightingEventId={lastLightingEventId} />
			))}
		</animated.group>
	);
}

export default LitSquareRing;
