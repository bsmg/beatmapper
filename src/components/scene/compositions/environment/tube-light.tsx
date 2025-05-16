import type { GroupProps } from "@react-three/fiber";

import { LightMaterial } from "$/components/scene/compositions/materials";
import type { UseLightPropsReturn } from "$/components/scene/hooks";

interface Props extends GroupProps {
	light: UseLightPropsReturn;
	length?: number;
	radius?: number;
}
function TubeLight({ length = 500, radius = 0.35, light, ...rest }: Props) {
	return (
		<group {...rest}>
			<mesh>
				<cylinderGeometry attach="geometry" args={[radius, radius, length]} />
				<LightMaterial light={light} />
			</mesh>
		</group>
	);
}

export default TubeLight;
