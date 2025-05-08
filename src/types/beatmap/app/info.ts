import type { EntityId } from "@reduxjs/toolkit";
import type { CharacteristicName, DifficultyName, EnvironmentName, EnvironmentV3Name } from "bsmap/types";

export type SongId = EntityId;
export type BeatmapId = EntityId;

export interface ModSettings {
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
		colorLeftOverdrive?: number;
		colorRight: string;
		colorRightOverdrive?: number;
		envColorLeft: string;
		envColorLeftOverdrive?: number;
		envColorRight: string;
		envColorRightOverdrive?: number;
		obstacleColor: string;
		obstacleColorOverdrive?: number;
	};
}

export interface Beatmap {
	beatmapId: BeatmapId;
	lightshowId: BeatmapId;
	characteristic: CharacteristicName;
	difficulty: DifficultyName;
	noteJumpSpeed: number;
	startBeatOffset: number;
	customLabel?: string;
}

export interface Song {
	id: SongId;
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
	difficultiesById: { [key: BeatmapId | string]: Beatmap };
	selectedDifficulty?: BeatmapId;
	createdAt?: number;
	lastOpenedAt?: number;
	demo?: boolean;
	modSettings: Partial<ModSettings>;
	enabledFastWalls?: boolean;
	enabledLightshow?: boolean;
}
