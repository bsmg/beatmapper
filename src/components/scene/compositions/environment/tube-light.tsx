import { LightMaterial } from "$/components/scene/compositions/materials";
import type { UseLightPropsReturn } from "$/components/scene/hooks";
import type { GroupProps } from "$/types/vendor";

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
