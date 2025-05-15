import type { EntityId } from "@reduxjs/toolkit";
import type { CharacteristicName, DifficultyName, EnvironmentAllName, EnvironmentName, EnvironmentV3Name } from "bsmap/types";

import type { ColorSchemeKey, IEntityMap } from "./shared";

export type SongId = EntityId;
export type BeatmapId = EntityId;

export interface IModSettings {
	mappingExtensions: {
		isEnabled: boolean;
		numRows: number;
		numCols: number;
		colWidth: number;
		rowHeight: number;
	};
	customColors: {
		isEnabled: boolean;
		colorLeft: string;
		colorRight: string;
		envColorLeft: string;
		envColorRight: string;
		envColorLeftBoost: string;
		envColorRightBoost: string;
		obstacleColor: string;
	};
}

export type IColorScheme = { [key in ColorSchemeKey]: string };

export interface IBeatmap {
	beatmapId: BeatmapId;
	lightshowId: BeatmapId;
	characteristic: CharacteristicName;
	difficulty: DifficultyName;
	noteJumpSpeed: number;
	startBeatOffset: number;
	environmentName: EnvironmentAllName;
	colorSchemeName: string | null;
	mappers: string[];
	lighters: string[];
	customLabel?: string;
}

export interface ISong {
	name: string;
	subName?: string;
	artistName: string;
	mapAuthorName?: string;
	bpm: number;
	offset: number;
	swingAmount?: number;
	swingPeriod?: number;
	previewStartTime: number;
	previewDuration: number;
	environment: EnvironmentName | EnvironmentV3Name;
	songFilename: string;
	coverArtFilename: string;
	colorSchemesById: IEntityMap<IColorScheme>;
	difficultiesById: IEntityMap<IBeatmap>;
	selectedDifficulty?: BeatmapId;
	createdAt?: number;
	lastOpenedAt?: number;
	demo?: boolean;
	modSettings: Partial<IModSettings>;
	enabledFastWalls?: boolean;
	enabledLightshow?: boolean;
}
