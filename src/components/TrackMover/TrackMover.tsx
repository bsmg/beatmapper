import { a, useSpring } from "@react-spring/three";
import type { PropsWithChildren } from "react";

import { useAppSelector } from "$/store/hooks";
import { getAnimateBlockMotion, getBeatDepth, getCursorPositionInBeats, selectActiveSongId } from "$/store/selectors";

interface Props extends PropsWithChildren {}

const TrackMover = ({ children }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const cursorPositionInBeats = useAppSelector((state) => getCursorPositionInBeats(state, songId));
	const beatDepth = useAppSelector(getBeatDepth);
	const animateBlockMotion = useAppSelector(getAnimateBlockMotion);

	const zPosition = (cursorPositionInBeats ?? 0) * beatDepth;

	const spring = useSpring({
		zPosition,
		immediate: !animateBlockMotion,
		config: {
			tension: 360,
			friction: 22,
			mass: 0.4,
		},
	});

	return <a.group position={spring.zPosition.to((interpolated) => [0, 0, interpolated])}>{children}</a.group>;
};

export default TrackMover;
