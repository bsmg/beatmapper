import type { Assign } from "@ark-ui/react";
import { Text3D } from "@react-three/drei";
import { type ComponentProps, memo } from "react";
import type { ColorRepresentation } from "three";

import { oswaldGlyphsUrl } from "$/assets";
import { BLOCK_CELL_SIZE, SURFACE_WIDTH } from "$/components/scene/constants";
import { DEFAULT_NUM_ROWS } from "$/constants";
import { getComputedToken } from "$/styles/helpers";

const Y_PADDING = 0.0075;
const Y_OFFSET = BLOCK_CELL_SIZE * (DEFAULT_NUM_ROWS * -0.5) + Y_PADDING;

const TEXT_PADDING = 0.5;

interface Props {
	height?: number;
	overextendBy?: number;
	color?: ColorRepresentation;
}
function Marker({ children, height, overextendBy = 0, color, ...rest }: Assign<ComponentProps<"group">, Props>) {
	return (
		<group {...rest} position-y={Y_OFFSET}>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position-x={overextendBy / 2}>
				<planeGeometry attach="geometry" args={[SURFACE_WIDTH + overextendBy, height]} />
				<meshStandardMaterial attach="material" color={color} />
			</mesh>
			<Text3D font={oswaldGlyphsUrl} size={0.4} height={0.025} curveSegments={2} position-x={SURFACE_WIDTH / 2 + TEXT_PADDING}>
				{children}
				<meshStandardMaterial attach="material" color={getComputedToken("colors.fg.default")} />
			</Text3D>
		</group>
	);
}

export default memo(Marker);
