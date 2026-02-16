import { useParams } from "@tanstack/react-router";
import type { wrapper } from "bsmap/types";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import type { Vector3Tuple } from "three";

import { SONG_OFFSET } from "$/components/scene/constants";
import { HIGHEST_PRECISION } from "$/constants";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCursorPositionInBeats } from "$/store/selectors";
import { useVisualizationContext } from "./context";

interface Props<T extends wrapper.IWrapGridObject> {
	objects: T[];
	resolvePosition: (model: T, ctx: { beatDepth: number }) => Vector3Tuple;
	resolveColor: (model: T) => string;
	children: (model: T, ctx: Pick<ComponentProps<"group">, "position" | "layers"> & { data: T; transparent: boolean; color?: string }) => ReactNode;
}
function VisualizationForGridObjects<T extends wrapper.IWrapGridObject>({ objects, resolvePosition, resolveColor, children }: Props<T>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const { beatDepth } = useVisualizationContext();

	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const zPosition = useMemo(() => -SONG_OFFSET + (cursorPositionInBeats ?? 0) * beatDepth, [cursorPositionInBeats, beatDepth]);
	const adjustment = useMemo(() => beatDepth * HIGHEST_PRECISION, [beatDepth]);

	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	return objects.map((data) => {
		const position = resolvePosition(data, { beatDepth });
		const noteZPosition = zPosition + position[2] - adjustment;
		return children(data, {
			data,
			position,
			transparent: noteZPosition > -SONG_OFFSET * 2,
			color: resolveColorForItem(resolveColor(data), { colorScheme }),
		});
	});
}

export default VisualizationForGridObjects;
