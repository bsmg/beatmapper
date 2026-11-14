import type { EntityId } from "@reduxjs/toolkit";
import type { IWrapGridObject } from "bsmap";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import type { Vector3Tuple } from "three";

import { SONG_OFFSET } from "$/components/scene/constants";
import type { ObjectResolverOptions } from "$/components/scene/helpers";
import { useAppSelector } from "$/store/hooks";
import { selectAnimateTrack, selectHighestPrecision, selectRotationLane } from "$/store/selectors";
import { convertDegreesToRadians, normalizeAngle } from "$/utils";
import { useVisualizationContext } from "./context";
import VisualizationMover from "./mover";

interface Props<T extends IWrapGridObject, Id extends EntityId> {
	objects: T[];
	resolveId: (model: T) => Id;
	resolvePosition: (model: T, ctx: ObjectResolverOptions) => Vector3Tuple;
	resolveColor: (model: T) => string;
	children: (model: T, id: Id, ctx: Pick<ComponentProps<"group">, "position" | "layers"> & { data: T; transparent: boolean; color: string }) => ReactNode;
}
function VisualizationForGridObjects<T extends IWrapGridObject, Id extends EntityId>({ objects, resolveId, resolvePosition, resolveColor, children }: Props<T, Id>) {
	const { cursorPosition, timescale, beatDepth } = useVisualizationContext();

	const animateTrack = useAppSelector(selectAnimateTrack);
	const highestPrecision = useAppSelector(selectHighestPrecision);
	const rotationLane = useAppSelector(selectRotationLane);

	const zPosition = useMemo(() => -SONG_OFFSET + (cursorPosition ?? 0) * beatDepth, [cursorPosition, beatDepth]);
	const adjustment = useMemo(() => beatDepth * highestPrecision, [beatDepth, highestPrecision]);

	const lanes = useMemo(() => Array.from(Map.groupBy(objects, (obj) => normalizeAngle(obj.laneRotation))), [objects]);

	return lanes.map(([yaw, objects]) => {
		return (
			<group key={`lane-${yaw}`} rotation-y={-convertDegreesToRadians(yaw - rotationLane)}>
				<VisualizationMover immediate={!animateTrack}>
					{objects.map((data) => {
						const id = resolveId(data);
						const position = resolvePosition(data, { timescale, beatDepth });
						const noteZPosition = zPosition + position[2] - adjustment;
						return children(data, id, {
							data,
							position,
							layers: 1,
							transparent: noteZPosition > -SONG_OFFSET * 2,
							color: resolveColor(data),
						});
					})}
				</VisualizationMover>
			</group>
		);
	});
}

export default VisualizationForGridObjects;
