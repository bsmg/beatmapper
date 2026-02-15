import { useSpring } from "@react-spring/three";
import { useParams } from "@tanstack/react-router";

import { useAppSelector } from "$/store/hooks";
import { selectAnimateTrack, selectCursorPositionInBeats } from "$/store/selectors";

interface UseTrackMoverOptions {
	beatDepth: number;
}
export function useTrackMover({ beatDepth }: UseTrackMoverOptions) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const animateBlockMotion = useAppSelector(selectAnimateTrack);

	return useSpring<{ zPosition: number }>(() => {
		return {
			zPosition: (cursorPositionInBeats ?? 0) * beatDepth,
			immediate: !animateBlockMotion,
			config: { tension: 360, friction: 22, mass: 0.4 },
		};
	}, [cursorPositionInBeats, beatDepth]);
}
