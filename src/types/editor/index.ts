import type { EntityId } from "@reduxjs/toolkit";

import type { App } from "$/types/beatmap";
import type { ColorSchemeKey, TrackType } from "./shared";

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

export interface IBackgroundBox {
	time: number;
	duration?: number | null;
	startColor?: App.EventColor;
	endColor?: App.EventColor;
	startBrightness?: number;
	endBrightness?: number;
}

export interface IEventTrack {
	type: TrackType;
	label?: string;
	side?: "left" | "right";
}

export type IEventTracks = Record<PropertyKey, IEventTrack>;

export interface IGrid {
	numCols: number;
	numRows: number;
	colWidth: number;
	rowHeight: number;
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
