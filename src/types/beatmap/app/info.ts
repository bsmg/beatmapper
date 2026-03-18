import type { CharacteristicName, DifficultyName, EnvironmentName, EnvironmentV2Name, EnvironmentV3Name } from "bsmap";

import type { BeatmapId, IColorScheme, IEntityMap, IGrid, SongId } from "$/types";

type IWrapModule<T> = { isEnabled: boolean } & T;

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
	environmentName: EnvironmentName;
	colorSchemeName: string | null;
	mappers: string[];
	lighters: string[];
	customLabel?: string;
}

export interface ISong {
	id: SongId;
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
	environment: EnvironmentV2Name | EnvironmentV3Name;
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
