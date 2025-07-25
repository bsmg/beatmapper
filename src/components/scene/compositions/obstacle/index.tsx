import type { GroupProps, ThreeEvent } from "@react-three/fiber";
import { memo, useCallback, useMemo } from "react";
import { BoxGeometry, DoubleSide } from "three";

import { token } from "$:styled-system/tokens";
import { useGlobalEventListener } from "$/components/hooks";
import { isFastObstacle } from "$/helpers/obstacles.helpers";
import type { App } from "$/types";

interface Props extends GroupProps {
	data: App.IObstacle;
	dimensions: { width: number; height: number; depth: number };
	color: string;
	onObstaclePointerDown?: (event: PointerEvent, obstacle: App.IObstacle) => void;
	onObstaclePointerUp?: (event: PointerEvent, obstacle: App.IObstacle) => void;
	onObstaclePointerOver?: (event: PointerEvent, obstacle: App.IObstacle) => void;
	onObstaclePointerOut?: (event: PointerEvent, obstacle: App.IObstacle) => void;
	onObstacleWheel?: (event: WheelEvent, obstacle: App.IObstacle) => void;
}
function Obstacle({ data: obstacle, dimensions, color, onObstaclePointerDown, onObstaclePointerUp, onObstaclePointerOver, onObstaclePointerOut, onObstacleWheel, ...rest }: Props) {
	const boxGeometry = useMemo(() => new BoxGeometry(dimensions.width, dimensions.height, dimensions.depth), [dimensions]);

	const handlePointerDown = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onObstaclePointerDown) onObstaclePointerDown(ev.nativeEvent, obstacle);
		},
		[obstacle, onObstaclePointerDown],
	);
	const handlePointerUp = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onObstaclePointerUp) onObstaclePointerUp(ev.nativeEvent, obstacle);
		},
		[obstacle, onObstaclePointerUp],
	);
	const handlePointerOver = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onObstaclePointerOver) onObstaclePointerOver(ev.nativeEvent, obstacle);
		},
		[obstacle, onObstaclePointerOver],
	);
	const handlePointerOut = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (onObstaclePointerOut) onObstaclePointerOut(ev.nativeEvent, obstacle);
		},
		[obstacle, onObstaclePointerOut],
	);
	const handleWheel = useCallback(
		(ev: WheelEvent) => {
			ev.stopPropagation();
			if (onObstacleWheel) onObstacleWheel(ev, obstacle);
		},
		[obstacle, onObstacleWheel],
	);

	useGlobalEventListener("wheel", handleWheel, { options: { passive: false } });

	return (
		<group {...rest}>
			<mesh onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
				<boxGeometry attach="geometry" args={[dimensions.width, dimensions.height, dimensions.depth]} />
				<meshPhongMaterial attach="material" color={color} transparent opacity={obstacle.tentative ? 0.15 : 0.4} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} side={DoubleSide} emissive={"yellow"} emissiveIntensity={obstacle.selected ? 0.125 : 0} />
			</mesh>
			<lineSegments>
				<edgesGeometry attach="geometry" args={[boxGeometry]} />
				<lineBasicMaterial attach="material" color={isFastObstacle(obstacle) ? token("colors.green.500") : obstacle.selected ? token("colors.yellow.500") : "white"} />
			</lineSegments>
		</group>
	);
}

export default memo(Obstacle);
