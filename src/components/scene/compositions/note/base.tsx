import type { ThreeEvent } from "@react-three/fiber";
import { type ComponentProps, type ReactNode, useCallback, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { useGlobalEventListener } from "$/components/hooks";
import { Obj } from "$/components/scene/atoms";
import type { App } from "$/types";

export interface BaseNoteProps<T extends App.IBaseNote> extends Omit<ComponentProps<typeof Obj>, "children"> {
	data: T;
	color?: ColorRepresentation;
	size?: number;
	metalness?: number;
	roughness?: number;
	transparent?: boolean;
	onNotePointerDown?: (event: PointerEvent, data: T) => void;
	onNotePointerOver?: (event: PointerEvent, data: T) => void;
	onNotePointerOut?: (event: PointerEvent, data: T) => void;
	onNoteWheel?: (event: WheelEvent, data: T) => void;
	children: (forwarded: { scale: number }) => ReactNode;
}
function BaseNote<T extends App.IBaseNote>({ path, children, data, color, size = 1, metalness, roughness, transparent, onNotePointerDown, onNotePointerOver, onNotePointerOut, onNoteWheel, ...rest }: BaseNoteProps<T>) {
	const scaleFactor = useMemo(() => size * 0.5, [size]);

	const handlePointerDown = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			event.stopPropagation();
			if (onNotePointerDown) onNotePointerDown(event.nativeEvent, data);
		},
		[data, onNotePointerDown],
	);
	const handlePointerOver = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			event.stopPropagation();
			if (onNotePointerOver) onNotePointerOver(event.nativeEvent, data);
		},
		[data, onNotePointerOver],
	);
	const handlePointerOut = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			event.stopPropagation();
			if (onNotePointerOut) onNotePointerOut(event.nativeEvent, data);
		},
		[data, onNotePointerOut],
	);
	const handleWheel = useCallback(
		(event: WheelEvent) => {
			event.stopPropagation();
			if (onNoteWheel) onNoteWheel(event, data);
		},
		[data, onNoteWheel],
	);

	useGlobalEventListener("wheel", handleWheel, { options: { passive: false } });

	return (
		<group onPointerDown={handlePointerDown} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
			<Obj {...rest} path={path} castShadow scale={[scaleFactor, scaleFactor, scaleFactor]}>
				<meshStandardMaterial attach="material" metalness={metalness} roughness={roughness} color={color} transparent={true} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={data.tentative ? 0.75 : transparent ? 0.25 : 1} />
			</Obj>
			{children({ scale: size })}
		</group>
	);
}

export default BaseNote;
