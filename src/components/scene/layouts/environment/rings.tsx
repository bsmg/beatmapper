import type { Assign } from "@ark-ui/react";
import { type Interpolation, useSprings, useTrail } from "@react-spring/three";
import type { wrapper } from "bsmap/types";
import type { ComponentProps, ReactNode } from "react";

import { useRingRotationEffect, useRingZoomEffect } from "$/components/scene/hooks/environment.hooks";
import { useAppSelector } from "$/store/hooks";
import { selectAnimateEnvironment } from "$/store/selectors";

interface Props {
	count: number;
	lastRotationEvent: wrapper.IWrapBasicEvent | null;
	lastZoomEvent: wrapper.IWrapBasicEvent | null;
	ratio?: number;
	minDistance?: number;
	maxDistance?: number;
	children: (index: number, props: { zPosition: Interpolation<number, number>; zRotation: Interpolation<number, number> }) => ReactNode;
}
function Rings({ count, lastRotationEvent, lastZoomEvent, minDistance, maxDistance, children, ...rest }: Assign<ComponentProps<"group">, Props>) {
	const animateRingMotion = useAppSelector(selectAnimateEnvironment);

	const [ratio] = useRingRotationEffect({ lastEvent: lastRotationEvent });
	const [distance] = useRingZoomEffect({ lastEvent: lastZoomEvent, minDistance });

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
				return children(index, { zPosition, zRotation });
			})}
		</group>
	);
}

export default Rings;
