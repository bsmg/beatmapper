import { type Interpolation, useSprings, useTrail } from "@react-spring/three";
import type { ReactNode } from "react";

import { useRingRotation, useRingZoom } from "$/components/scene/hooks";
import { resolveEventId } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectAnimateEnvironment } from "$/store/selectors";
import type { App } from "$/types";
import type { GroupProps } from "$/types/vendor";

interface Props extends Omit<GroupProps, "children"> {
	count: number;
	lastRotationEvent: App.IBasicEvent | null | undefined;
	lastZoomEvent: App.IBasicEvent | null | undefined;
	ratio?: number;
	minDistance?: number;
	maxDistance?: number;
	children: (index: number, props: { zPosition: Interpolation<number, number>; zRotation: Interpolation<number, number> }) => ReactNode;
}
function Rings({ count, lastRotationEvent, lastZoomEvent, minDistance, maxDistance, children, ...rest }: Props) {
	const animateRingMotion = useAppSelector(selectAnimateEnvironment);

	const [ratio] = useRingRotation({ lastEventId: lastRotationEvent ? resolveEventId(lastRotationEvent) : null });
	const [distance] = useRingZoom({ lastEventId: lastZoomEvent ? resolveEventId(lastZoomEvent) : null, minDistance });

	const [rotation] = useTrail(
		count,
		(index) => {
			return {
				ratio: ratio,
				immediate: !animateRingMotion,
				delay: index * 50,
			};
		},
		[count, ratio],
	);

	const [zoom] = useSprings(count, () => {
		return {
			distance: distance,
			immediate: !animateRingMotion,
		};
	}, [count, distance]);

	return (
		<group {...rest}>
			{rotation.map((props, index) => {
				const zRotation = props.ratio.to((o) => o);
				const zPosition = zoom[index].distance.to((o) => o * index * -1);
				// @ts-ignore
				return children(index, { zPosition, zRotation });
			})}
		</group>
	);
}

export default Rings;
