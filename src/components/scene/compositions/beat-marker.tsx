import { Text3D } from "@react-three/drei";
import { Fragment, memo, useMemo } from "react";

import { oswaldGlyphsUrl } from "$/assets";
import { BLOCK_COLUMN_WIDTH, SURFACE_WIDTH } from "$/components/scene/constants";
import { DEFAULT_NUM_ROWS } from "$/constants";

const Y_PADDING = 0.0075;
const Y_OFFSET = BLOCK_COLUMN_WIDTH * (DEFAULT_NUM_ROWS * -0.5) + Y_PADDING;

const TEXT_PADDING = 0.5;

interface Props {
	beatNum: number;
	offset: number;
	type: "beat" | "sub-beat";
}
function BeatMarker({ beatNum, offset, type }: Props) {
	const depth = useMemo(() => (type === "beat" ? 0.2 : 0.08), [type]);
	const color = useMemo(() => (type === "sub-beat" ? "#AAAAAA" : "#FFFFFF"), [type]);
	const label = useMemo(() => (type === "beat" ? beatNum.toString() : ""), [type, beatNum]);
	const overextendBy = useMemo(() => (type === "beat" ? 0.3 : 0), [type]);

	const lineWidth = useMemo(() => SURFACE_WIDTH + overextendBy, [overextendBy]);
	const xOffset = useMemo(() => overextendBy / 2, [overextendBy]);

	return (
		<Fragment>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[xOffset, Y_OFFSET, offset]}>
				<planeGeometry attach="geometry" args={[lineWidth, depth]} />
				<meshStandardMaterial attach="material" color={color} />
			</mesh>

			{typeof beatNum === "number" && (
				<Text3D font={oswaldGlyphsUrl} size={0.4} height={0.025} curveSegments={2} position={[SURFACE_WIDTH / 2 + TEXT_PADDING, Y_OFFSET, offset]}>
					{label}
				</Text3D>
			)}
		</Fragment>
	);
}

export default memo(BeatMarker);
