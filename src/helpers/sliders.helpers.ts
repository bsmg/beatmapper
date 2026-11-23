import { createArc, createChain, type IWrapArc, type IWrapBaseSlider, type IWrapChain, SliderMidAnchorMode } from "bsmap";

import type { IPlacementContext } from "$/components/scene/layouts/placement-grid/machine";
import { DEFAULT_GRID } from "$/constants";
import { type IGrid, NotePlacementMode } from "$/types";
import { convertGridCell } from "./grid.helpers";
import { serializeCoordinate } from "./item.helpers";

export function isArc(data: unknown): data is IWrapArc {
	if (typeof data !== "object" || !data) return false;
	return "midAnchor" in data;
}
export function isChain(data: unknown): data is IWrapChain {
	if (typeof data !== "object" || !data) return false;
	return "sliceCount" in data;
}

export function resolveSliderId<T extends Pick<IWrapBaseSlider, "time" | "posX" | "posY" | "tailTime" | "tailPosX" | "tailPosY">>(x: T) {
	let baseId = `${x.time}/${x.posX}/${x.posY}`;
	if (isArc(x)) baseId += `/${x.tailTime}/${x.tailPosX}/${x.tailPosY}/${x.lengthMultiplier}/${x.tailLengthMultiplier}`;
	return baseId;
}

export function createSliderPlacementFactory<T extends IWrapBaseSlider>(createSlider: (data: Partial<IWrapBaseSlider>) => T) {
	return ({ cellDownAt, cellOverAt, time, duration }: Pick<IPlacementContext, "cellDownAt" | "cellOverAt" | "time" | "duration">, mode: NotePlacementMode, grid: IGrid = DEFAULT_GRID, data: Partial<T> = {}) => {
		if (!cellDownAt || !cellOverAt) return null;

		const isExtended = mode === NotePlacementMode.EXTENSIONS;

		const { colIndex, rowIndex } = convertGridCell(cellDownAt, grid);
		const { colIndex: tailColIndex, rowIndex: tailRowIndex } = convertGridCell(cellOverAt, grid);

		return createSlider({
			time: time ?? 0,
			tailTime: (time ?? 0) + (duration ?? 0),
			posX: serializeCoordinate(colIndex, isExtended),
			tailPosX: serializeCoordinate(tailColIndex, isExtended),
			posY: serializeCoordinate(rowIndex, isExtended),
			tailPosY: serializeCoordinate(tailRowIndex, isExtended),
			...data,
		});
	};
}

export const createArcFromMouseEvent = createSliderPlacementFactory((data) => {
	return createArc({ ...data, lengthMultiplier: 1, tailLengthMultiplier: 1, midAnchor: SliderMidAnchorMode.STRAIGHT });
});
export const createChainFromMouseEvent = createSliderPlacementFactory((data) => {
	return createChain({ ...data, sliceCount: 5, squish: 1 });
});
