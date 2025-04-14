// TODO: This code is largely duplicated with Block.js. There's probably a smart abstraction, but for now the duplication doesn't bug me much.

import { memo } from "react";
import type { ColorRepresentation, Mesh, Vector3Tuple } from "three";

import { mineUrl } from "$/assets";
import { useObject } from "$/components/hooks";
import { ObjectSelectionMode } from "$/types";

interface Props {
	x: number;
	y: number;
	z: number;
	time?: number;
	lineLayer?: number;
	lineIndex?: number;
	size?: number;
	color?: ColorRepresentation;
	isTransparent?: boolean;
	isSelected?: boolean;
	selectionMode?: ObjectSelectionMode | null;
	handleClick?: (clickType: "left" | "middle" | "right", time: number, lineLayer: number, lineIndex: number) => void;
	handleStartSelecting?: (selectionMode: ObjectSelectionMode) => void;
	handleMouseOver?: (time: number, lineLayer: number, lineIndex: number) => void;
}

/**
 * Mines are an anti-block; you don't want to hit them with your saber.
 */
const Mine = ({ x, y, z, time, lineLayer, lineIndex, color, size = 1, isTransparent, isSelected, handleClick, handleStartSelecting, handleMouseOver }: Props) => {
	const position: Vector3Tuple = [x, y, z];

	const scaleFactor = size * 0.5;

	const group = useObject(mineUrl);

	if (!group) {
		return null;
	}

	const geometry = (group.children[0] as Mesh).geometry;

	return (
		<group>
			<mesh
				castShadow
				position={position}
				scale={[scaleFactor, scaleFactor, scaleFactor]}
				onClick={(ev) => {
					ev.stopPropagation();
				}}
				onPointerDown={(ev) => {
					ev.stopPropagation();

					// We can rapidly select/deselect/delete notes by clicking, holding, and dragging the cursor across the field.
					let newSelectionMode: ObjectSelectionMode | null = null;
					if (ev.button === 0) {
						newSelectionMode = isSelected ? ObjectSelectionMode.DESELECT : ObjectSelectionMode.SELECT;
					} else if (ev.button === 1) {
						// Middle clicks shouldnt affect selections
						newSelectionMode = null;
					} else if (ev.button === 2) {
						newSelectionMode = ObjectSelectionMode.DELETE;
					}

					if (newSelectionMode) {
						if (handleStartSelecting) handleStartSelecting(newSelectionMode);
					}

					const clickType = ev.button === 0 ? "left" : ev.button === 1 ? "middle" : ev.button === 2 ? "right" : undefined;

					if (clickType) {
						if (handleClick && time !== undefined && lineLayer !== undefined && lineIndex !== undefined) handleClick(clickType, time, lineLayer, lineIndex);
					}
				}}
				onPointerOver={(ev) => {
					// While selecting/deselecting/deleting notes, pointer-over events are important and should trump others.
					ev.stopPropagation();
					if (handleMouseOver && time !== undefined && lineLayer !== undefined && lineIndex !== undefined) handleMouseOver(time, lineLayer, lineIndex);
				}}
			>
				<primitive object={geometry} attach="geometry" />
				<meshStandardMaterial attach="material" metalness={0.75} roughness={0.4} color={color} transparent={isTransparent} emissive={"yellow"} emissiveIntensity={isSelected ? 0.5 : 0} opacity={isTransparent ? 0.25 : 1} />
			</mesh>
		</group>
	);
};

export default memo(Mine);
