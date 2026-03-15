import type { IWrapGridObject } from "bsmap";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import type { Vector3Tuple } from "three";

import { SONG_OFFSET } from "$/components/scene/constants";
import { HIGHEST_PRECISION } from "$/constants";
import { type IVisualizationContext, useVisualizationContext } from "./context";

interface Props<T extends IWrapGridObject> {
	objects: T[];
	resolvePosition: (model: T, ctx: Pick<IVisualizationContext, "beatDepth">) => Vector3Tuple;
	resolveColor: (model: T) => string;
	children: (model: T, ctx: Pick<ComponentProps<"group">, "position" | "layers"> & { data: T; transparent: boolean; color: string }) => ReactNode;
}
function VisualizationForGridObjects<T extends IWrapGridObject>({ objects, resolvePosition, resolveColor, children }: Props<T>) {
	const { cursorPositionInBeats, beatDepth } = useVisualizationContext();

	const zPosition = useMemo(() => -SONG_OFFSET + (cursorPositionInBeats ?? 0) * beatDepth, [cursorPositionInBeats, beatDepth]);
	const adjustment = useMemo(() => beatDepth * HIGHEST_PRECISION, [beatDepth]);

	return objects.map((data) => {
		const position = resolvePosition(data, { beatDepth });
		const noteZPosition = zPosition + position[2] - adjustment;
		return children(data, {
			data,
			position,
			layers: 1,
			transparent: noteZPosition > -SONG_OFFSET * 2,
			color: resolveColor(data),
		});
	});
}

export default VisualizationForGridObjects;
