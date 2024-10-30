import type { EntityId } from "@reduxjs/toolkit";
import type { App } from "../beatmap";

export * from "./shared";

export interface IGrid {
	numCols: number;
	numRows: number;
	colWidth: number;
	rowHeight: number;
}

export type GridPresets = Record<string, IGrid>;

export interface ISelectionBox extends Pick<DOMRect, "left" | "right" | "top" | "bottom"> {
	height?: number;
	width?: number;
}
export interface ISelectionBoxInBeats {
	startBeat: number;
	endBeat: number;
	startTrackIndex: number;
	endTrackIndex: number;
}

export interface IBackgroundBox {
	id: EntityId;
	beatNum: number;
	duration?: number | null;
	colorType?: App.EventColorType;
}
