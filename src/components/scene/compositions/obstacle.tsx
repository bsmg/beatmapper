import type { Assign } from "@ark-ui/react";
import { animated, useSpring } from "@react-spring/three";
import type { IWrapObstacle } from "bsmap";
import { type ComponentProps, useMemo } from "react";
import { BoxGeometry, type ColorRepresentation, DoubleSide } from "three";

import { MOVEMENT_SPRING } from "$/components/scene/constants";
import { resolveDimensionsForObstacle } from "$/components/scene/helpers";
import { isFastObstacle } from "$/helpers/obstacles.helpers";
import type { App } from "$/types";
import { token } from "$:styled-system/tokens";

export interface ObstacleProps<T extends IWrapObstacle> {
	data: App.IWrapEditorObject<T>;
	timescale?: (time: number) => number;
	beatDepth: number;
	color?: ColorRepresentation;
}

export function Obstacle<T extends IWrapObstacle>({ data, timescale, beatDepth, position, color, onPointerDown, onPointerOver, onPointerOut, onWheel, ...rest }: Assign<ComponentProps<"group">, ObstacleProps<T>>) {
	const dimensions = useMemo(() => resolveDimensionsForObstacle(data, { timescale, beatDepth }), [data, timescale, beatDepth]);

	const { scaleZ, posZ } = useSpring({
		scaleZ: dimensions[2],
		posZ: Array.isArray(position) ? position[2] : typeof position === "object" && "z" in position ? position.z : 0,
		config: MOVEMENT_SPRING,
	});

	const boxGeometry = useMemo(() => new BoxGeometry(dimensions[0], dimensions[1], 1), [dimensions[0], dimensions[1]]);

	return (
		<animated.group {...rest} userData={data} position={position} position-z={posZ}>
			<animated.mesh scale-z={scaleZ} castShadow layers={rest.layers} onPointerDown={onPointerDown} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onWheel={onWheel}>
				<boxGeometry attach="geometry" args={[dimensions[0], dimensions[1], 1]} />
				<meshPhongMaterial attach="material" color={color} transparent opacity={data.tentative ? 0.15 : 0.4} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} side={DoubleSide} emissive={"yellow"} emissiveIntensity={data.selected ? 0.125 : 0} />
			</animated.mesh>
			<animated.lineSegments scale-z={scaleZ}>
				<edgesGeometry attach="geometry" args={[boxGeometry]} />
				<lineBasicMaterial attach="material" color={data.selected ? token("colors.yellow.500") : isFastObstacle(data) ? token("colors.green.500") : "white"} />
			</animated.lineSegments>
		</animated.group>
	);
}
