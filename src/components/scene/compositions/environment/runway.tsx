import { Fragment, useMemo } from "react";

import { BLOCK_CELL_SIZE, SONG_OFFSET, SURFACE_HEIGHT, SURFACE_WIDTH } from "$/components/scene/constants";
import { DEFAULT_NUM_ROWS, SURFACE_DEPTHS } from "$/constants";
import { useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality } from "$/store/selectors";

const GRID_Y_BASE = BLOCK_CELL_SIZE * (DEFAULT_NUM_ROWS * -0.5);

const PEG_WIDTH = 0.5;
const PEG_HEIGHT = 20;
const PEG_X_OFFSET = SURFACE_WIDTH / 2 - PEG_WIDTH;

const pegY = GRID_Y_BASE - 10.25;

const STRIP_PADDING = 0.01;
const STRIP_WIDTH = 0.1;

const STRIP_Y = GRID_Y_BASE + STRIP_PADDING;
const STRIP_X = SURFACE_WIDTH / 2 - STRIP_WIDTH / 2;

interface Props {
	includeEdgeStrips?: boolean;
	trackGridRows?: boolean;
}
function EnvironmentRunway({ includeEdgeStrips }: Props) {
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	const surfaceDepth = useMemo(() => SURFACE_DEPTHS[graphicsLevel], [graphicsLevel]);
	const surfaceZCenter = useMemo(() => surfaceDepth / 2 + SONG_OFFSET - 1, [surfaceDepth]);
	const pegDepth = useMemo(() => surfaceDepth - PEG_WIDTH * 4, [surfaceDepth]);
	const stripZ = useMemo(() => -SONG_OFFSET - surfaceDepth / 2, [surfaceDepth]);

	return (
		<Fragment>
			{/* Surface */}
			<mesh position={[0, GRID_Y_BASE - SURFACE_HEIGHT / 2, -surfaceZCenter]} receiveShadow>
				<boxGeometry attach="geometry" args={[SURFACE_WIDTH, SURFACE_HEIGHT, surfaceDepth]} />
				<meshStandardMaterial metalness={0.5} roughness={1} attach="material" color="#222222" />
			</mesh>
			{/* Pegs */}
			<mesh position={[-PEG_X_OFFSET, pegY, -surfaceZCenter]}>
				<boxGeometry attach="geometry" args={[PEG_WIDTH, PEG_HEIGHT, pegDepth]} />
				<meshStandardMaterial metalness={0.1} roughness={0} attach="material" color="#222222" />
			</mesh>
			<mesh position={[PEG_X_OFFSET, pegY, -surfaceZCenter]}>
				<boxGeometry attach="geometry" args={[PEG_WIDTH, PEG_HEIGHT, pegDepth]} />
				<meshStandardMaterial metalness={0.1} roughness={0} attach="material" color="#222222" />
			</mesh>
			{/* Edge light strips */}
			{includeEdgeStrips && (
				<Fragment>
					<mesh position-x={-STRIP_X} position-y={STRIP_Y} position-z={stripZ} rotation={[-Math.PI / 2, 0, 0]}>
						<planeGeometry attach="geometry" args={[STRIP_WIDTH, surfaceDepth]} />
						<meshStandardMaterial attach="material" color="#FFF" />
					</mesh>
					<mesh position-x={STRIP_X} position-y={STRIP_Y} position-z={stripZ} rotation={[-Math.PI / 2, 0, 0]}>
						<planeGeometry attach="geometry" args={[STRIP_WIDTH, surfaceDepth]} />
						<meshStandardMaterial attach="material" color="#FFF" />
					</mesh>
				</Fragment>
			)}
		</Fragment>
	);
}

export default EnvironmentRunway;
