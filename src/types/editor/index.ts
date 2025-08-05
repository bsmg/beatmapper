import type { EntityId } from "@reduxjs/toolkit";

import type { App } from "$/types/beatmap";
import type { ColorSchemeKey, TrackType } from "./shared";

export * from "./shared";

export type IEntityMap<T> = { [key in EntityId]: T };

export type IColorScheme = { [key in ColorSchemeKey]: string };

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

export interface ISelectionBoxInBeats {
	startBeat: number;
	endBeat: number;
	startTrackIndex: number;
	endTrackIndex: number;
	withPrevious?: boolean;
}
