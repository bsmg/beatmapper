import type { Assign } from "@ark-ui/react";
import { animated } from "@react-spring/three";
import type { ComponentProps } from "react";

import { type UseLightSpringOptions, useLightSpring } from "../../hooks/use-light-spring";

const CHEVRON_SIDE_LENGTH = 5;
const CHEVRON_THICKNESS = 0.5;
const CHEVRON_X_OFFSET = CHEVRON_SIDE_LENGTH / 2 - CHEVRON_THICKNESS * 1.25;
const CHEVRON_ANGLE = Math.PI * 0.2;

function Chevron({ light, ...rest }: Assign<ComponentProps<"group">, UseLightSpringOptions>) {
	const [lightSpring, lightProps] = useLightSpring({ light });

	return (
		<group {...rest}>
			<mesh position-x={CHEVRON_X_OFFSET} position-y={CHEVRON_THICKNESS / 2} rotation-z={-CHEVRON_ANGLE}>
				<boxGeometry attach="geometry" args={[CHEVRON_SIDE_LENGTH, CHEVRON_THICKNESS, CHEVRON_THICKNESS]} />
				<animated.meshLambertMaterial attach="material" {...lightSpring} {...lightProps} />
			</mesh>
			<mesh position-x={-CHEVRON_X_OFFSET} position-y={CHEVRON_THICKNESS / 2} rotation-z={CHEVRON_ANGLE}>
				<boxGeometry attach="geometry" args={[CHEVRON_SIDE_LENGTH, CHEVRON_THICKNESS, CHEVRON_THICKNESS]} />
				<animated.meshLambertMaterial attach="material" {...lightSpring} {...lightProps} />
			</mesh>
		</group>
	);
}

export default Chevron;
