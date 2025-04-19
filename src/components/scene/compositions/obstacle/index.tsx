import { type GroupProps, type ThreeEvent, extend } from "@react-three/fiber";
import { memo, useCallback, useMemo } from "react";
import { BoxGeometry, DoubleSide } from "three";
import { TextGeometry } from "three-stdlib";

import { token } from "$:styled-system/tokens";
import { useMousewheel } from "$/components/hooks";
import type { App } from "$/types";
import { getDimensionsForObstacle, getPositionForObstacle } from "./helpers";

extend({ TextGeometry });

interface Props extends GroupProps {
	data: App.Obstacle;
	color: string;
	beatDepth: number;
	gridRows?: number;
	gridCols?: number;
	onObstaclePointerDown?: (event: PointerEvent, obstacle: App.Obstacle) => void;
	onObstaclePointerUp?: (event: PointerEvent, obstacle: App.Obstacle) => void;
	onObstaclePointerOver?: (event: PointerEvent, obstacle: App.Obstacle) => void;
	onObstaclePointerOut?: (event: PointerEvent, obstacle: App.Obstacle) => void;
	onObstacleWheel?: (event: WheelEvent, obstacle: App.Obstacle) => void;
}

function ObstacleBox({ data: obstacle, color, beatDepth, onObstaclePointerDown, onObstaclePointerUp, onObstaclePointerOver, onObstaclePointerOut, onObstacleWheel, ...rest }: Props) {
	const obstacleDimensions = useMemo(() => getDimensionsForObstacle(obstacle, beatDepth), [obstacle, beatDepth]);

	const boxGeometry = useMemo(() => new BoxGeometry(obstacleDimensions.width, obstacleDimensions.height, obstacleDimensions.depth), [obstacleDimensions]);

	const actualPosition = useMemo(() => getPositionForObstacle(obstacle, obstacleDimensions, beatDepth), [obstacle, obstacleDimensions, beatDepth]);

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
			ev.preventDefault();
			if (onObstacleWheel) onObstacleWheel(ev, obstacle);
		},
		[obstacle, onObstacleWheel],
	);

	useMousewheel((ev) => handleWheel(ev));

	return (
		<group {...rest}>
			<mesh position={actualPosition} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
				<boxGeometry attach="geometry" args={[obstacleDimensions.width, obstacleDimensions.height, obstacleDimensions.depth]} />
				<meshPhongMaterial attach="material" color={color} transparent opacity={obstacle.tentative ? 0.15 : 0.4} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} side={DoubleSide} emissive={"yellow"} emissiveIntensity={obstacle.selected ? 0.125 : 0} />
			</mesh>
			<lineSegments position={actualPosition}>
				<edgesGeometry attach="geometry" args={[boxGeometry]} />
				<lineBasicMaterial attach="material" color={obstacle.fast ? token("colors.green.500") : obstacle.selected ? token("colors.yellow.500") : "white"} />
			</lineSegments>
		</group>
	);
}

export default memo(ObstacleBox);
