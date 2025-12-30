import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { Obstacle, resolveDimensionsForObstacle, resolvePositionForObstacle } from "$/components/scene/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectAllVisibleObstacles, selectColorScheme } from "$/store/selectors";
import { type App, ObjectTool } from "$/types";

interface Props {
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
	handlePointerDown: (event: PointerEvent, data: App.IObstacle) => void;
	handlePointerOver: (event: PointerEvent, data: App.IObstacle) => void;
	handlePointerOut: (event: PointerEvent) => void;
	handleWheel: (event: WheelEvent, data: App.IObstacle) => void;
}
function EditorObstacles({ beatDepth, surfaceDepth, handlePointerDown, handlePointerOver, handlePointerOut, handleWheel }: Props) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const obstacles = useAppSelector((state) => selectAllVisibleObstacles(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));

	const obstacleColor = useMemo(() => resolveColorForItem(ObjectTool.OBSTACLE, { colorScheme }), [colorScheme]);

	return obstacles.map((obstacle) => {
		const actualPosition = resolvePositionForObstacle(obstacle, { beatDepth });
		const obstacleDimensions = resolveDimensionsForObstacle(obstacle, { beatDepth });
		return (
			<Obstacle
				key={resolveObstacleId(obstacle)}
				layers={1}
				data={obstacle}
				position={actualPosition}
				dimensions={obstacleDimensions}
				color={obstacleColor}
				onPointerDown={(e) => handlePointerDown(e.nativeEvent, obstacle)}
				onPointerOver={(e) => handlePointerOver(e.nativeEvent, obstacle)}
				onPointerOut={(e) => handlePointerOut(e.nativeEvent)}
				onWheel={(e) => handleWheel(e.nativeEvent, obstacle)}
			/>
		);
	});
}

export default EditorObstacles;
