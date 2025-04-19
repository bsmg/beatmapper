import { memo, useMemo } from "react";
import type { Vector3Tuple } from "three";

import { App } from "$/types";
import BaseNote, { type BaseNoteProps } from "./base";
import { getBlockUrlForDirection, getRotationForDirection } from "./helpers";

function ColorNote({ position, data, size = 1, ...rest }: Omit<BaseNoteProps<Omit<App.ColorNote, "color">>, "path">) {
	const index = useMemo(() => Object.values(App.CutDirection).indexOf(data.direction), [data.direction]);

	const url = useMemo(() => getBlockUrlForDirection(index), [index]);
	const rotation = useMemo(() => getRotationForDirection(index), [index]);

	const arrowPosition = useMemo(() => {
		const newPos = position as Vector3Tuple;
		return [newPos[0], newPos[1], newPos[2] + size * 0.2] as Vector3Tuple;
	}, [position, size]);

	return (
		<BaseNote {...rest} data={data} path={url} position={position} rotation-z={rotation} size={size} metalness={0.5} roughness={0.4}>
			{/* Fake flowing light from within */}
			<mesh position={arrowPosition} rotation-z={rotation}>
				<planeGeometry attach="geometry" args={[size * 0.8, size * 0.8]} />
				<meshLambertMaterial attach="material" emissive={0xffffff} transparent={rest.transparent} opacity={rest.transparent ? 0.25 : 1} />
			</mesh>
		</BaseNote>
	);
}

export default memo(ColorNote);
