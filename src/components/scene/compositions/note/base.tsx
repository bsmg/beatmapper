import { type ComponentProps, type ReactNode, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { Obj } from "$/components/scene/atoms";
import type { App } from "$/types";

export interface BaseNoteProps<T extends App.IBaseNote> extends Omit<ComponentProps<typeof Obj>, "children"> {
	data: T;
	color?: ColorRepresentation;
	size?: number;
	metalness?: number;
	roughness?: number;
	transparent?: boolean;
	children: (forwarded: { scale: number }) => ReactNode;
}
function BaseNote<T extends App.IBaseNote>({ path, children, data, color, size = 1, metalness, roughness, transparent, addEventListener, removeEventListener, onPointerDown, onPointerOver, onPointerOut, onWheel, ...rest }: BaseNoteProps<T>) {
	const scaleFactor = useMemo(() => size * 0.5, [size]);

	return (
		<group userData={data} layers={rest.layers} onPointerDown={onPointerDown} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onWheel={onWheel}>
			<Obj {...rest} path={path} castShadow scale={[scaleFactor, scaleFactor, scaleFactor]}>
				<meshStandardMaterial attach="material" metalness={metalness} roughness={roughness} color={color} transparent={true} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={data.tentative ? 0.75 : transparent ? 0.25 : 1} />
			</Obj>
			{children({ scale: size })}
		</group>
	);
}

export default BaseNote;
