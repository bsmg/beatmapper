import type { ThreeEvent } from "@react-three/fiber";
import { type ComponentProps, useCallback, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { Obj } from "$/components/scene/atoms";
import type { App } from "$/types";

export interface BaseNoteProps<T extends App.IBaseNote> extends ComponentProps<typeof Obj> {
	data: Pick<T, "time" | "posX" | "posY" | "direction" | "selected">;
	color?: ColorRepresentation;
	size?: number;
	metalness?: number;
	roughness?: number;
	transparent?: boolean;
	onNoteClick?: (event: PointerEvent, data: Pick<T, "time" | "posX" | "posY" | "direction" | "selected">) => void;
	onNoteMouseOver?: (event: PointerEvent, data: Pick<T, "time" | "posX" | "posY" | "direction" | "selected">) => void;
}
function BaseNote<T extends App.IBaseNote>({ path, children, data, color, size = 1, metalness, roughness, transparent, onNoteClick: handleClick, onNoteMouseOver: handleMouseOver, ...rest }: BaseNoteProps<T>) {
	const scaleFactor = useMemo(() => size * 0.5, [size]);

	const handlePointerDown = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (handleClick && data.time !== undefined && data.posY !== undefined && data.posX !== undefined) handleClick(ev.nativeEvent, data);
		},
		[data, handleClick],
	);

	const handlePointerOver = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (handleMouseOver && data.time !== undefined && data.posY !== undefined && data.posX !== undefined) handleMouseOver(ev.nativeEvent, data);
		},
		[data, handleMouseOver],
	);

	return (
		<group onPointerDown={handlePointerDown} onPointerOver={handlePointerOver}>
			<Obj {...rest} path={path} castShadow scale={[scaleFactor, scaleFactor, scaleFactor]}>
				<meshStandardMaterial attach="material" metalness={metalness} roughness={roughness} color={color} transparent={true} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={transparent ? 0.25 : 1} />
			</Obj>
			{children}
		</group>
	);
}

export default BaseNote;
