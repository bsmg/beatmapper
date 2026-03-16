import type { EntityId } from "@reduxjs/toolkit";

import type { ColorSchemeKey } from "./shared";

export * from "./shared";

export type IEntityMap<T> = { [key in EntityId]: T };

export type IColorScheme = {
	[ColorSchemeKey.SABER_LEFT]: string;
	[ColorSchemeKey.SABER_RIGHT]: string;
	[ColorSchemeKey.OBSTACLE]: string;
	[ColorSchemeKey.ENV_LEFT]: string;
	[ColorSchemeKey.ENV_RIGHT]: string;
	[ColorSchemeKey.ENV_WHITE]?: string;
	[ColorSchemeKey.BOOST_LEFT]: string;
	[ColorSchemeKey.BOOST_RIGHT]: string;
	[ColorSchemeKey.BOOST_WHITE]?: string;
};

export interface ILightState {
	color: string | null;
	brightness: number | null;
}
export interface IBackgroundBox {
	time: number;
	duration: number | null;
	startState: { [key in keyof ILightState]: NonNullable<ILightState[key]> };
	endState: { [key in keyof ILightState]: NonNullable<ILightState[key]> };
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

export interface IGridCell {
	colIndex: number;
	rowIndex: number;
}

export interface ISelectionBoxInBeats {
	startBeat: number;
	endBeat: number;
	startTrackIndex: number;
	endTrackIndex: number;
	withPrevious?: boolean;
}
