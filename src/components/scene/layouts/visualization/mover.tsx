import { animated, useSpring } from "@react-spring/three";
import type { PropsWithChildren } from "react";

import { MOVEMENT_SPRING } from "$/components/scene/constants";
import { useAppSelector } from "$/store/hooks";
import { selectAnimateTrack } from "$/store/selectors";
import { useVisualizationContext } from "./context";

function VisualizationMover({ children }: PropsWithChildren) {
	const { cursorPosition, beatDepth } = useVisualizationContext();

	const animateTrack = useAppSelector(selectAnimateTrack);

	const [spring] = useSpring(() => {
		return {
			cursorPosition,
			immediate: !animateTrack,
			config: MOVEMENT_SPRING,
		};
	}, [cursorPosition, animateTrack]);

	return <animated.group position-z={spring.cursorPosition.to((z) => z * beatDepth)}>{children}</animated.group>;
}

export default VisualizationMover;
