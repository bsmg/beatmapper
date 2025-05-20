import { animated, useSpring } from "@react-spring/three";
import { type PropsWithChildren, useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectAnimateBlockMotion, selectCursorPositionInBeats } from "$/store/selectors";
import type { SongId } from "$/types";

interface Props extends PropsWithChildren {
	sid: SongId;
	beatDepth: number;
}
function TrackMover({ sid, beatDepth, children }: Props) {
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const animateBlockMotion = useAppSelector(selectAnimateBlockMotion);

	const zPosition = useMemo(() => (cursorPositionInBeats ?? 0) * beatDepth, [cursorPositionInBeats, beatDepth]);

	const [spring] = useSpring(() => {
		return {
			zPosition,
			immediate: !animateBlockMotion,
			config: { tension: 360, friction: 22, mass: 0.4 },
		};
	}, [zPosition]);

	return <animated.group position={spring.zPosition.to((interpolated) => [0, 0, interpolated])}>{children}</animated.group>;
}

export default TrackMover;
