import type { Member } from "$/types/utils";

export const ObjectType = {
	NOTE: "block",
	BOMB: "mine",
	OBSTACLE: "obstacle",
	ARC: "arc",
	CHAIN: "chain",
} as const;
export type ObjectType = Member<typeof ObjectType>;

export const ObjectColor = {
	LEFT: "left",
	RIGHT: "right",
} as const;
export type ObjectColor = Member<typeof ObjectColor>;

export const ObjectSelectionMode = {
	SELECT: "select",
	DESELECT: "deselect",
	DELETE: "delete",
} as const;
export type ObjectSelectionMode = Member<typeof ObjectSelectionMode>;

export const NotePlacementMode = {
	NORMAL: "normal",
	EXTENSIONS: "mapping-extensions",
} as const;
export type NotePlacementMode = Member<typeof NotePlacementMode>;

export const ObstaclePlacementMode = {
	LEGACY: "legacy",
	MODERN: "modern",
	VISUAL: "visual",
	EXTENSIONS: "mapping-extensions",
} as const;
export type ObstaclePlacementMode = Member<typeof ObstaclePlacementMode>;

export interface IGridCell {
	colIndex: number;
	rowIndex: number;
}

export interface IGrid {
	numCols: number;
	numRows: number;
	colWidth: number;
	rowHeight: number;
	colOffset: number;
	rowOffset: number;
}

export type IGridPresets = Record<string, IGrid>;
