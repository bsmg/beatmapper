import type { Assign } from "@ark-ui/react";
import { animated, useSpring } from "@react-spring/three";
import type { PropsWithChildren } from "react";

import { useVisualizationContext } from "./context";

interface Props {
	immediate?: boolean;
}
function VisualizationMover({ children, immediate }: Assign<PropsWithChildren, Props>) {
	const { cursorPositionInBeats, beatDepth } = useVisualizationContext();

	const [spring] = useSpring<{ zPosition: number }>(() => {
		return {
			zPosition: cursorPositionInBeats * beatDepth,
			immediate: immediate,
			config: { tension: 360, friction: 22, mass: 0.4 },
		};
	}, [cursorPositionInBeats, beatDepth]);

	return <animated.group position-z={spring.zPosition}>{children}</animated.group>;
}

export default VisualizationMover;
