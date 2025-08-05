import { memo, useMemo } from "react";
import { BoxGeometry, type ColorRepresentation, DoubleSide } from "three";

import { isFastObstacle } from "$/helpers/obstacles.helpers";
import type { App } from "$/types";
import type { GroupProps } from "$/types/vendor";
import { token } from "$:styled-system/tokens";

interface Props extends GroupProps {
	data: App.IObstacle;
	dimensions: { width: number; height: number; depth: number };
	color: ColorRepresentation;
}
function Obstacle({ data, dimensions, color, onPointerDown, onPointerOver, onPointerOut, onWheel, ...rest }: Props) {
	const boxGeometry = useMemo(() => new BoxGeometry(dimensions.width, dimensions.height, dimensions.depth), [dimensions]);

	return (
		<group {...rest} userData={data}>
			<mesh layers={rest.layers} onPointerDown={onPointerDown} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onWheel={onWheel}>
				<boxGeometry attach="geometry" args={[dimensions.width, dimensions.height, dimensions.depth]} />
				<meshPhongMaterial attach="material" color={color} transparent opacity={data.tentative ? 0.15 : 0.4} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} side={DoubleSide} emissive={"yellow"} emissiveIntensity={data.selected ? 0.125 : 0} />
			</mesh>
			<lineSegments>
				<edgesGeometry attach="geometry" args={[boxGeometry]} />
				<lineBasicMaterial attach="material" color={isFastObstacle(data) ? token("colors.green.500") : data.selected ? token("colors.yellow.500") : "white"} />
			</lineSegments>
		</group>
	);
}

export default memo(Obstacle);
