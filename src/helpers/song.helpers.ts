import { toPascalCase } from "@std/text/to-pascal-case";
import { EnvironmentName, NoteJumpSpeed } from "bsmap";

import { DEFAULT_GRID } from "$/constants";
import type { App, BeatmapId, ColorSchemeKey, IColorScheme, IGrid, RequiredKeys, SongId } from "$/types";
import { deepAssign } from "$/utils";
import { deriveColorSchemeFromEnvironment } from "./colors.helpers";

export function createSongId(x: Pick<App.ISong, "name">, currentIds?: SongId[]): string {
	let songId = toPascalCase(x.name.replaceAll(/[^a-zA-Z0-9 ]+/g, ""));

	if (currentIds?.some((id) => id === songId)) {
		if ("prompt" in window) {
			const override = window.prompt("Your map was flagged as a duplicate.\n\nIf you don't want to override the contents of your pre-existing map, please enter a unique identifier:", songId);

			if (override) {
				songId = override;
			} else {
				songId = `${songId}-${Date.now().toString(16).slice(-3)}`;
			}
		} else {
			songId = `${songId}-${Date.now().toString(16).slice(-3)}`;
		}
	}
	return songId;
}
export function resolveSongId(x: Pick<App.ISong, "id">): string {
	return x.id.toString();
}
export function resolveBeatmapId(x: Pick<App.IBeatmap, "characteristic" | "difficulty">): string {
	if (x.characteristic !== "Standard") return `${x.difficulty}${x.characteristic}`;
	return `${x.difficulty}`;
}

export function createAppSong(data: RequiredKeys<Partial<App.ISong>, "name" | "bpm" | "songFilename" | "coverArtFilename">): App.ISong {
	return {
		id: data.id ?? createSongId(data),
		name: data.name,
		subName: data.subName ?? "",
		artistName: data.artistName ?? "",
		bpm: data.bpm,
		offset: data.offset ?? 0,
		previewStartTime: data.previewStartTime ?? 12,
		previewDuration: data.previewDuration ?? 10,
		environment: data.environment ?? EnvironmentName[0],
		songFilename: data.songFilename,
		coverArtFilename: data.coverArtFilename,
		colorSchemesById: data.colorSchemesById ?? {},
		difficultiesById: data.difficultiesById ?? {},
		selectedDifficulty: data.selectedDifficulty,
		createdAt: data.createdAt ?? Date.now(),
		lastOpenedAt: data.lastOpenedAt,
		demo: data.demo,
		modSettings: data.modSettings ?? {
			customColors: { isEnabled: false },
			mappingExtensions: { isEnabled: false },
		},
	} as App.ISong;
}
export function createAppBeatmap(data: RequiredKeys<Partial<App.IBeatmap>, "characteristic" | "difficulty">): App.IBeatmap {
	const beatmapId = resolveBeatmapId(data);

	return {
		lightshowId: data.lightshowId ?? beatmapId,
		characteristic: data.characteristic,
		difficulty: data.difficulty,
		noteJumpSpeed: data.noteJumpSpeed ?? NoteJumpSpeed.FallbackNJS[data.difficulty],
		startBeatOffset: data.startBeatOffset ?? 0,
		environmentName: data.environmentName ?? EnvironmentName[0],
		colorSchemeName: data.colorSchemeName ?? null,
		mappers: data.mappers ?? [],
		lighters: data.lighters ?? [],
		customLabel: data.customLabel,
	} as App.IBeatmap;
}

export function getEnvironment<T extends Pick<App.ISong, "environment" | "difficultiesById">>(song: T, beatmapId?: BeatmapId) {
	const beatmap = beatmapId ? song.difficultiesById[beatmapId] : null;
	return beatmap ? (beatmap.environmentName ?? song.environment) : song.environment;
}
export function getColorScheme<T extends Pick<App.ISong, "environment" | "difficultiesById" | "colorSchemesById" | "modSettings">>(song: T, beatmapId?: BeatmapId, colorSchemePreset?: string): IColorScheme {
	const customOverrideScheme = song.modSettings.customColors;
	const beatmap = beatmapId ? song.difficultiesById[beatmapId] : null;
	const vanillaOverrideScheme = beatmap?.colorSchemeName ? song.colorSchemesById[beatmap.colorSchemeName] : null;
	const environment = getEnvironment(song, beatmapId);
	const envScheme = deriveColorSchemeFromEnvironment(environment, colorSchemePreset);

	function resolveColor<T extends string | undefined>(key: ColorSchemeKey): T {
		if (customOverrideScheme?.isEnabled && customOverrideScheme[key]) {
			return customOverrideScheme[key] as T;
		}
		if (vanillaOverrideScheme) {
			const isNoteColorOverride = key === "colorLeft" || key === "colorRight" || key === "obstacleColor";

			if (isNoteColorOverride && !!vanillaOverrideScheme.overrideNotes) {
				return vanillaOverrideScheme[key] as T;
			}
			if (!isNoteColorOverride && !!vanillaOverrideScheme.overrideLights) {
				return vanillaOverrideScheme[key] as T;
			}
		}
		return envScheme[key] as T;
	}

	return {
		colorLeft: resolveColor("colorLeft"),
		colorRight: resolveColor("colorRight"),
		obstacleColor: resolveColor("obstacleColor"),
		envColorLeft: resolveColor("envColorLeft"),
		envColorRight: resolveColor("envColorRight"),
		envColorWhite: resolveColor("envColorWhite"),
		envColorLeftBoost: resolveColor("envColorLeftBoost"),
		envColorRightBoost: resolveColor("envColorRightBoost"),
		envColorWhiteBoost: resolveColor("envColorWhiteBoost"),
	};
}
export function getGridSize<T extends Pick<App.ISong, "modSettings">>(song: T, grid: IGrid = DEFAULT_GRID): IGrid {
	const { isEnabled: isMappingExtensionsEnabled, numCols, numRows, colWidth, rowHeight, colOffset, rowOffset } = { ...song.modSettings.mappingExtensions };

	if (!isMappingExtensionsEnabled) {
		return grid;
	}
	return deepAssign<IGrid>(grid, {
		numCols: numCols ?? DEFAULT_GRID.numCols,
		numRows: numRows ?? DEFAULT_GRID.numRows,
		colWidth: colWidth ?? DEFAULT_GRID.colWidth,
		rowHeight: rowHeight ?? DEFAULT_GRID.rowHeight,
		colOffset: colOffset ?? DEFAULT_GRID.colOffset,
		rowOffset: rowOffset ?? DEFAULT_GRID.rowOffset,
	});
}
