import type { EntityId } from "@reduxjs/toolkit";
import type { CharacteristicName, DifficultyName, EnvironmentAllName, EnvironmentName, EnvironmentV3Name } from "bsmap/types";

import type { IColorScheme, IEntityMap, IGrid } from "$/types/editor";
import type { Accept } from "$/types/utils";

export type SongId = EntityId;
export type BeatmapId = EntityId;

export interface IModule {
	isEnabled: boolean;
}

type IWrapModule<T> = IModule & T;

export interface IModSettings {
	mappingExtensions: IWrapModule<Partial<IGrid>>;
	customColors: IWrapModule<Partial<IColorScheme>>;
}

export interface IBeatmap {
	lightshowId: BeatmapId;
	characteristic: CharacteristicName;
	difficulty: DifficultyName;
	noteJumpSpeed: number;
	startBeatOffset: number;
	environmentName: Accept<EnvironmentAllName, string>;
	colorSchemeName: string | null;
	mappers: string[];
	lighters: string[];
	customLabel?: string;
}

export interface ISong {
	id: EntityId;
	name: string;
	subName: string;
	artistName: string;
	/** @deprecated */
	mapAuthorName?: string;
	bpm: number;
	offset: number;
	/** @deprecated */
	swingAmount?: number;
	/** @deprecated */
	swingPeriod?: number;
	previewStartTime: number;
	previewDuration: number;
	environment: Accept<EnvironmentName | EnvironmentV3Name, string>;
	songFilename: string;
	coverArtFilename: string;
	colorSchemesById: IEntityMap<IColorScheme>;
	difficultiesById: IEntityMap<IBeatmap>;
	selectedDifficulty?: BeatmapId;
	createdAt?: number;
	lastOpenedAt?: number;
	demo?: boolean;
	modSettings: Partial<IModSettings>;
	/** @deprecated */
	enabledFastWalls?: boolean;
	/** @deprecated */
	enabledLightshow?: boolean;
}
