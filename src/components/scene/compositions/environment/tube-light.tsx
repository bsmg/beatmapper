import type { ThreeElements } from "@react-three/fiber";
import type { EntityId } from "@reduxjs/toolkit";
import type { ColorRepresentation } from "three";

import { LightMaterial } from "$/components/scene/compositions/materials";
import type { App } from "$/types";

type GroupProps = ThreeElements["group"];

interface Props extends GroupProps {
	color: ColorRepresentation;
	brightness?: number;
	status: App.LightEventType;
	lastEventId: EntityId | null;
	length?: number;
	radius?: number;
}
function TubeLight({ color, status, lastEventId, length = 500, radius = 0.35, ...rest }: Props) {
	return (
		<group {...rest}>
			<mesh>
				<cylinderGeometry attach="geometry" args={[radius, radius, length]} />
				<LightMaterial lastEventId={lastEventId} status={status} color={color} />
			</mesh>
		</group>
	);
}

export default TubeLight;
