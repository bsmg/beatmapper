import type { Assign } from "@ark-ui/react";
import { NoteDirection } from "bsmap";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { blockCenterUrl, blockDirectionalUrl, mineUrl } from "$/assets";
import { Obj, useOBJ } from "$/components/scene/atoms";
import { resolveRotationForNote } from "$/components/scene/helpers";
import type { App } from "$/types";

export interface BaseNoteProps<T extends App.IBaseNote> {
	data: T;
	color?: ColorRepresentation;
	metalness?: number;
	roughness?: number;
	transparent?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: react three fiber types are wonky
	children?: (inherited: any) => ReactNode;
}

function BaseNote<T extends App.IBaseNote>({ path, children, data, color, metalness, roughness, transparent, onPointerDown, onPointerOver, onPointerOut, onWheel, ...rest }: Assign<ComponentProps<typeof Obj>, BaseNoteProps<T>>) {
	return (
		<group userData={data}>
			<Obj {...rest} path={path} castShadow scale={0.5} onPointerDown={onPointerDown} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onWheel={onWheel}>
				<meshStandardMaterial attach="material" metalness={metalness} roughness={roughness} color={color} transparent={true} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={data.tentative ? 0.75 : transparent ? 0.25 : 1} />
			</Obj>
			{children?.({ ...rest, transparent, onPointerDown, onPointerOver, onPointerOut, onWheel })}
		</group>
	);
}

useOBJ.preload(blockCenterUrl);
useOBJ.preload(blockDirectionalUrl);

export function ColorNote({ data, ...rest }: Omit<ComponentProps<typeof BaseNote<App.IColorNote>>, "path" | "children">) {
	const url = useMemo(() => {
		// If the direction is >=1000, we'll want to use mapping extensions.
		// - for 2000-2360 range, it should be a dot note
		if (data.direction >= 2000) return blockCenterUrl;
		// - for 1000-1360 range, it should be directional
		if (data.direction >= 1000) return blockDirectionalUrl;

		switch (data.direction) {
			case NoteDirection.UP:
			case NoteDirection.DOWN:
			case NoteDirection.LEFT:
			case NoteDirection.RIGHT:
			case NoteDirection.UP_LEFT:
			case NoteDirection.UP_RIGHT:
			case NoteDirection.DOWN_LEFT:
			case NoteDirection.DOWN_RIGHT: {
				return blockDirectionalUrl;
			}
			case NoteDirection.ANY: {
				return blockCenterUrl;
			}
			default: {
				throw new Error(`Unrecognized direction: ${data.direction}`);
			}
		}
	}, [data.direction]);

	const rotation = useMemo(() => resolveRotationForNote(data), [data]);

	return (
		<BaseNote {...rest} data={data} path={url} rotation-z={rotation} metalness={0.5} roughness={0.4}>
			{/* Fake flowing light from within */}
			{({ position, "rotation-z": rotation, transparent }) => (
				<mesh position={position} rotation-z={rotation}>
					<planeGeometry attach="geometry" args={[0.8, 0.8]} />
					<meshLambertMaterial attach="material" emissive={0xffffff} transparent={true} opacity={transparent ? 0.25 : 1} />
				</mesh>
			)}
		</BaseNote>
	);
}

useOBJ.preload(mineUrl);

export function BombNote({ ...rest }: Omit<ComponentProps<typeof BaseNote<App.IBombNote>>, "path" | "children">) {
	return <BaseNote {...rest} path={mineUrl} metalness={0.75} roughness={0.4} />;
}
