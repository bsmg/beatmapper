import { memo, useMemo } from "react";
import type { Vector3Tuple } from "three";

import type { App } from "$/types";
import { resolveRotationForNote } from "../../helpers";
import BaseNote, { type BaseNoteProps } from "./base";
import { resolvePathForNoteDirection } from "./helpers";

function ColorNote({ position, data, size = 1, ...rest }: Omit<BaseNoteProps<App.IColorNote>, "path" | "children">) {
	const url = useMemo(() => resolvePathForNoteDirection(data.direction), [data.direction]);

	const rotation = useMemo(() => resolveRotationForNote(data), [data]);

	const arrowPosition = useMemo(() => {
		const newPos = position as Vector3Tuple;
		return [newPos[0], newPos[1], newPos[2] + size * 0.2] as Vector3Tuple;
	}, [position, size]);

	return (
		<BaseNote {...rest} data={data} path={url} position={position} rotation-z={rotation} size={size} metalness={0.5} roughness={0.4}>
			{/* Fake flowing light from within */}
			{({ scale: size }) => (
				<mesh position={arrowPosition} rotation-z={rotation}>
					<planeGeometry attach="geometry" args={[size * 0.8, size * 0.8]} />
					<meshLambertMaterial attach="material" emissive={0xffffff} transparent={true} opacity={rest.transparent ? 0.25 : 1} />
				</mesh>
			)}
		</BaseNote>
	);
}

export default memo(ColorNote);
