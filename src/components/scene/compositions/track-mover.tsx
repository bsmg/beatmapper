import { animated, useSpring } from "@react-spring/three";
import type { PropsWithChildren } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectAnimateTrack, selectCursorPositionInBeats } from "$/store/selectors";
import type { SongId } from "$/types";

interface Props extends PropsWithChildren {
	sid: SongId;
	beatDepth: number;
}
function TrackMover({ sid, beatDepth, children }: Props) {
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const animateBlockMotion = useAppSelector(selectAnimateTrack);

	const [spring] = useSpring(() => {
		return {
			zPosition: (cursorPositionInBeats ?? 0) * beatDepth,
			immediate: !animateBlockMotion,
			config: { tension: 360, friction: 22, mass: 0.4 },
		};
	}, [cursorPositionInBeats, beatDepth]);

	return <animated.group position-z={spring.zPosition}>{children}</animated.group>;
}

export default TrackMover;
