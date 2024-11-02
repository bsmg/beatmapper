import { Fragment, memo } from "react";
import { Font } from "three-stdlib";

import { oswaldGlyphs } from "$/assets";
import { BLOCK_COLUMN_WIDTH, DEFAULT_NUM_ROWS, SURFACE_WIDTH } from "$/constants";

// @ts-ignore false positive + augmentation hell = time to sin
const font = new Font(oswaldGlyphs);
const textGeometryOptions = {
	font,
	size: 0.4,
	height: 0.025,
	curveSegments: 2,
};

interface Props {
	beatNum: number;
	offset: number;
	type: "beat" | "sub-beat";
}

const Marker = ({ beatNum, offset, type }: Props) => {
	const Y_PADDING = 0.0075;
	const yOffset = BLOCK_COLUMN_WIDTH * (DEFAULT_NUM_ROWS * -0.5) + Y_PADDING;

	const depth = type === "beat" ? 0.2 : 0.08;

	const color = type === "sub-beat" ? "#AAAAAA" : "#FFFFFF";

	const textPadding = 0.5;

	const label = type === "beat" ? String(beatNum) : "";

	const overextendBy = type === "beat" ? 0.3 : 0;
	const lineWidth = SURFACE_WIDTH + overextendBy;
	const xOffset = overextendBy / 2;

	return (
		<Fragment>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[xOffset, yOffset, offset]}>
				<planeGeometry attach="geometry" args={[lineWidth, depth]} />
				<meshStandardMaterial attach="material" color={color} />
			</mesh>

			{typeof beatNum === "number" && (
				<mesh position={[SURFACE_WIDTH / 2 + textPadding, yOffset, offset]}>
					<textGeometry attach="geometry" args={[label, textGeometryOptions]} />
					<meshLambertMaterial attach="material" color="#AAA" />
				</mesh>
			)}
		</Fragment>
	);
};

export default memo(Marker);
