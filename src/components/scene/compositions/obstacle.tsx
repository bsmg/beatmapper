import type { Assign } from "@ark-ui/react";
import type { IWrapObstacle } from "bsmap";
import { type ComponentProps, useMemo } from "react";
import { BoxGeometry, type ColorRepresentation, DoubleSide } from "three";

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

	const boxGeometry = useMemo(() => new BoxGeometry(...dimensions), [dimensions]);

	return (
		<group {...rest} userData={data} position={position}>
			<mesh castShadow layers={rest.layers} onPointerDown={onPointerDown} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onWheel={onWheel}>
				<boxGeometry attach="geometry" args={dimensions} />
				<meshPhongMaterial attach="material" color={color} transparent opacity={data.tentative ? 0.15 : 0.4} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} side={DoubleSide} emissive={"yellow"} emissiveIntensity={data.selected ? 0.125 : 0} />
			</mesh>
			<lineSegments>
				<edgesGeometry attach="geometry" args={[boxGeometry]} />
				<lineBasicMaterial attach="material" color={data.selected ? token("colors.yellow.500") : isFastObstacle(data) ? token("colors.green.500") : "white"} />
			</lineSegments>
		</group>
	);
}
