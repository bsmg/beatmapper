import type { ThreeEvent } from "@react-three/fiber";
import { memo } from "react";
import type { ColorRepresentation, Mesh, Vector3Tuple } from "three";

import { blockCenterUrl, blockDirectionalUrl } from "$/assets";
import { useObject } from "$/hooks";
import { CutDirection, ObjectSelectionMode } from "$/types";
import { convertDegreesToRadians } from "$/utils";

const getBlockUrlForDirection = (direction: CutDirection) => {
	// If the direction is >=1000, that means it's a MappingExtensions thing.
	// Must be directional.
	if (direction >= 1000) {
		return blockDirectionalUrl;
	}

	switch (direction) {
		case CutDirection.UP:
		case CutDirection.DOWN:
		case CutDirection.LEFT:
		case CutDirection.RIGHT:
		case CutDirection.UP_LEFT:
		case CutDirection.UP_RIGHT:
		case CutDirection.DOWN_LEFT:
		case CutDirection.DOWN_RIGHT:
			return blockDirectionalUrl;
		case CutDirection.ANY:
			return blockCenterUrl;
		default:
			throw new Error(`Unrecognized direction: ${direction}`);
	}
};

const getRotationForDirection = (direction: CutDirection) => {
	// If the rotation is >=1000, we're in MappingExtensions land :D
	// It uses a 1000-1360 system, from down clockwise.
	// We have some conversions to do, to get an angle in radians.
	if (direction >= 1000) {
		// (this formula is a little bonkers, there's probably a simpler way.)
		// (but it works.)
		const reorientedAngle = 180 - ((direction + 270) % 360);
		const angleInRads = convertDegreesToRadians(reorientedAngle);

		return angleInRads;
	}

	// The numbering system used is completely nonsensical:
	//
	//   4  0  5
	//   2  8  3
	//   6  1  7
	//
	// Our block by default points downwards, so we'll do x-axis rotations depending on the number
	switch (direction) {
		case CutDirection.UP:
			return Math.PI;
		case CutDirection.DOWN:
			return 0;
		case CutDirection.LEFT:
			return Math.PI * -0.5;
		case CutDirection.RIGHT:
			return Math.PI * 0.5;
		case CutDirection.UP_LEFT:
			return Math.PI * -0.75;
		case CutDirection.UP_RIGHT:
			return Math.PI * 0.75;
		case CutDirection.DOWN_LEFT:
			return Math.PI * -0.25;
		case CutDirection.DOWN_RIGHT:
			return Math.PI * 0.25;

		case CutDirection.ANY:
			return 0;

		default:
			throw new Error(`Unrecognized direction: ${direction}`);
	}
};

interface Props {
	x: number;
	y: number;
	z: number;
	time?: number;
	lineLayer?: number;
	lineIndex?: number;
	direction: CutDirection;
	size?: number;
	color?: ColorRepresentation;
	isTransparent?: boolean;
	isSelected?: boolean;
	selectionMode?: ObjectSelectionMode | null;
	handleClick?: (clickType: "left" | "middle" | "right", time: number, lineLayer: number, lineIndex: number) => void;
	handleStartSelecting?: (selectionMode: ObjectSelectionMode) => void;
	handleMouseOver?: (time: number, lineLayer: number, lineIndex: number) => void;
}

const Block = ({ x, y, z, time, lineLayer, lineIndex, direction, size = 1, color = 0xff0000, isTransparent, isSelected, selectionMode, handleClick, handleStartSelecting, handleMouseOver }: Props) => {
	const position: Vector3Tuple = [x, y, z];

	const scaleFactor = size * 0.5;

	const url = getBlockUrlForDirection(direction);
	const group = useObject(url);

	if (!group) {
		return null;
	}

	const geometry = (group.children[0] as Mesh).geometry;

	const rotation: Vector3Tuple = [0, 0, getRotationForDirection(direction)];

	const onClick = (ev: ThreeEvent<MouseEvent>) => {
		ev.stopPropagation();
	};

	const onPointerDown = (ev: ThreeEvent<MouseEvent>) => {
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
	};

	const onPointerOver = (ev: ThreeEvent<PointerEvent>) => {
		// While selecting/deselecting/deleting notes, pointer-over events are important and should trump others.
		if (selectionMode) {
			ev.stopPropagation();
			if (handleMouseOver && time !== undefined && lineLayer !== undefined && lineIndex !== undefined) handleMouseOver(time, lineLayer, lineIndex);
		}
	};

	return (
		<group>
			<mesh castShadow position={position} scale={[scaleFactor, scaleFactor, scaleFactor]} rotation={rotation} onClick={onClick} onPointerDown={onPointerDown} onPointerOver={onPointerOver}>
				<primitive object={geometry} attach="geometry" />
				<meshStandardMaterial attach="material" metalness={0.5} roughness={0.4} color={color} transparent={isTransparent} emissive={"yellow"} emissiveIntensity={isSelected ? 0.5 : 0} opacity={isTransparent ? 0.25 : 1} />
			</mesh>

			{/* Fake flowing light from within */}
			<mesh position={[position[0], position[1], position[2] + size * 0.2]} rotation={rotation} onClick={onClick} onPointerDown={onPointerDown} onPointerOver={onPointerOver}>
				<planeGeometry attach="geometry" args={[size * 0.8, size * 0.8]} />
				<meshLambertMaterial attach="material" emissive={0xffffff} transparent={isTransparent} opacity={isTransparent ? 0.25 : 1} />
			</mesh>
		</group>
	);
};

export default memo(Block);
