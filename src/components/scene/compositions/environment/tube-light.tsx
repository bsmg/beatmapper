import { animated } from "@react-spring/three";

import type { UseLightPropsReturn } from "$/components/scene/hooks";
import { useLightSpring } from "$/components/scene/hooks/use-light-spring";
import type { GroupProps } from "$/types/vendor";

interface Props extends GroupProps {
	length?: number;
	radius?: number;
	light: UseLightPropsReturn;
}
function TubeLight({ length = 500, radius = 0.35, light, ...rest }: Props) {
	const { spring, ...lightProps } = useLightSpring({ light });

	return (
		<group {...rest}>
			<mesh>
				<cylinderGeometry attach="geometry" args={[radius, radius, length]} />
				<animated.meshLambertMaterial attach="material" {...spring} {...lightProps} />
			</mesh>
		</group>
	);
}

export default TubeLight;
