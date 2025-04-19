import type { Assign } from "@ark-ui/react";
import type { ThreeEvent } from "@react-three/fiber";
import { type ComponentProps, useCallback, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { Obj } from "$/components/scene/atoms";
import type { App } from "$/types";

export type BaseNoteProps<T extends App.IBaseNote> = Assign<
	ComponentProps<typeof Obj>,
	{
		data: Omit<T, "id">;
		color?: ColorRepresentation;
		size?: number;
		metalness?: number;
		roughness?: number;
		transparent?: boolean;
		onNoteClick?: (event: PointerEvent, data: Omit<T, "id">) => void;
		onNoteMouseOver?: (event: PointerEvent, data: Omit<T, "id">) => void;
	}
>;
function BaseNote<T extends App.IBaseNote>({ path, children, data, color, size = 1, metalness, roughness, transparent, onNoteClick: handleClick, onNoteMouseOver: handleMouseOver, ...rest }: BaseNoteProps<T>) {
	const scaleFactor = useMemo(() => size * 0.5, [size]);

	const handlePointerDown = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (handleClick && data.beatNum !== undefined && data.rowIndex !== undefined && data.colIndex !== undefined) handleClick(ev.nativeEvent, data);
		},
		[data, handleClick],
	);

	const handlePointerOver = useCallback(
		(ev: ThreeEvent<PointerEvent>) => {
			ev.stopPropagation();
			if (handleMouseOver && data.beatNum !== undefined && data.rowIndex !== undefined && data.colIndex !== undefined) handleMouseOver(ev.nativeEvent, data);
		},
		[data, handleMouseOver],
	);

	return (
		<group onPointerDown={handlePointerDown} onPointerOver={handlePointerOver}>
			<Obj {...rest} path={path} castShadow scale={[scaleFactor, scaleFactor, scaleFactor]}>
				<meshStandardMaterial attach="material" metalness={metalness} roughness={roughness} color={color} transparent={transparent} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={transparent ? 0.25 : 1} />
			</Obj>
			{children}
		</group>
	);
}

export default BaseNote;
