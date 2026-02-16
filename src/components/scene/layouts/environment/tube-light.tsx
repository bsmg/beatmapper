import type { Assign } from "@ark-ui/react";
import { animated } from "@react-spring/three";
import type { ComponentProps } from "react";

import { type UseLightSpringOptions, useLightSpring } from "$/components/scene/hooks/use-light-spring";

interface Props {
	length?: number;
	radius?: number;
}
function TubeLight({ length = 500, radius = 0.35, light, ...rest }: Assign<ComponentProps<"mesh">, Props & UseLightSpringOptions>) {
	const [lightSpring, lightProps] = useLightSpring({ light });

	return (
		<mesh {...rest}>
			<cylinderGeometry attach="geometry" args={[radius, radius, length]} />
			<animated.meshLambertMaterial attach="material" {...lightSpring} {...lightProps} />
		</mesh>
	);
}

export default TubeLight;
