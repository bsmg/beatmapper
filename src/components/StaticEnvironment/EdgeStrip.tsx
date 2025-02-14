import type { Vector3Tuple } from "three";

import { SONG_OFFSET, SURFACE_DEPTHS } from "$/constants";
import { useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality } from "$/store/selectors";
import { Quality } from "$/types";

import RectAreaLight from "../RectAreaLight";

interface Props {
	x: number;
	y: number;
	z?: number;
	width?: number;
	depth?: number;
}

const EdgeStrip = ({ x, y, z: zProp, width = 0.1 }: Props) => {
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	const depth = SURFACE_DEPTHS[graphicsLevel];

	const renderAs = graphicsLevel === Quality.HIGH ? "light" : "plane";

	const z = zProp ?? -SONG_OFFSET - depth / 2;

	if (renderAs === "light") {
		// This strip can either be a RectAreaLight, to cast on the blocks, or it can be a simple plane. This is dependent on the performance tuning.
		// Because hooks can't be conditional, I always need to create a value for lookAt.
		const lookAt: Vector3Tuple = [x, y + 10, z];

		return <RectAreaLight intensity={0.8} width={width} height={depth} position={[x, y, z]} lookAt={lookAt} />;
	}
	return (
		<mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry attach="geometry" args={[width, depth]} />
			<meshStandardMaterial attach="material" color="#FFF" />
		</mesh>
	);
};

export default EdgeStrip;
