import { slugify } from "@std/text/unstable-slugify";
import { CharacteristicName, DifficultyName } from "bsmap/types";

import { DEFAULT_GRID } from "$/constants";
import type { App, BeatmapId, ColorSchemeKey, IColorScheme, IGrid } from "$/types";
import { deepAssign } from "$/utils";
import { deriveColorSchemeFromEnvironment } from "./colors.helpers";
import { patchEnvironmentName } from "./packaging.helpers";

export function resolveSongId(x: Pick<App.ISong, "name">): string {
	return slugify(x.name);
}
export function resolveBeatmapId(x: Pick<App.IBeatmap, "characteristic" | "difficulty">): string {
	if (x.characteristic !== "Standard") return `${x.difficulty}${x.characteristic}`;
	return `${x.difficulty}`;
}
export function resolveBeatmapIdFromFilename(filename: string): string {
	let fn = filename;
	for (const ext of [".json", ".dat", ".beatmap", ".lightshow"]) {
		fn = fn.replace(ext, "");
	}
	return fn;
}
export function resolveLightshowIdFromFilename(filename: string, beatmapId: BeatmapId): string {
	const rawId = resolveBeatmapIdFromFilename(filename);
	return rawId !== "Unnamed" ? rawId : beatmapId.toString();
}
/** @deprecated this is really only used during migration flow, don't use this elsewhere */
export function resolveDifficultyFromBeatmapId(bid: BeatmapId) {
	for (const difficulty of ["ExpertPlus", "Expert", "Hard", "Normal", "Easy"].reverse()) {
		if (difficulty === bid.toString()) return difficulty.substring(0, difficulty.length);
	}
	throw new Error(`Could not resolve difficulty from id: ${bid}`);
}

export function isSongReadonly<T extends Pick<App.ISong, "demo">>(song: T) {
	return !!song.demo;
}
export function isModuleEnabled<T extends Pick<App.ISong, "modSettings">>(song: T, key: keyof App.IModSettings) {
	return !!song.modSettings[key]?.isEnabled;
}

export function getSongMetadata<T extends Pick<App.ISong, "name" | "subName" | "artistName">>(song: T) {
	return { title: song.name, subtitle: song.subName, artist: song.artistName };
}
export function getBeatmaps<T extends Pick<App.ISong, "difficultiesById">>(song: T) {
	return song.difficultiesById;
}
export function getAllBeatmaps<T extends Pick<App.ISong, "difficultiesById">>(song: T) {
	return Object.values(song.difficultiesById).sort(sortBeatmaps);
}
export function getBeatmapIds<T extends Pick<App.ISong, "difficultiesById">>(song: T) {
	return Object.keys(song.difficultiesById);
}
export function getBeatmapById<T extends Pick<App.ISong, "difficultiesById">>(song: T, beatmapId: BeatmapId) {
	return song.difficultiesById[beatmapId];
}
export function getEnvironment<T extends Pick<App.ISong, "difficultiesById" | "environment">>(song: T, beatmapId?: BeatmapId) {
	const beatmap = beatmapId ? getBeatmapById(song, beatmapId) : undefined;
	if (beatmap) return patchEnvironmentName(beatmap.environmentName);
	return patchEnvironmentName(song.environment);
}
export function getSelectedBeatmap<T extends Pick<App.ISong, "selectedDifficulty" | "difficultiesById">>(song: T) {
	return song.selectedDifficulty ?? Object.keys(song.difficultiesById)[0];
}
export function getEditorOffset<T extends Pick<App.ISong, "offset">>(song: T) {
	return song.offset;
}
export function getSongLastOpenedAt<T extends Pick<App.ISong, "lastOpenedAt">>(song: T) {
	return song.lastOpenedAt ?? 0;
}

function getDefaultModSettings(): App.IModSettings {
	return {
		customColors: { isEnabled: false },
		mappingExtensions: { isEnabled: false },
	};
}

export function getModSettings<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T): App.IModSettings {
	return { ...getDefaultModSettings(), ...song.modSettings };
}
export function getModuleData<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T, key: keyof App.IModSettings) {
	const modSettings = getModSettings(song);
	return modSettings[key];
}
export function getCustomColorsModule<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T) {
	const modSettings = getModSettings(song);
	return modSettings.customColors;
}
export function getColorScheme<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T, beatmapId?: BeatmapId): IColorScheme {
	const customOverrideScheme = getCustomColorsModule(song);
	const beatmap = beatmapId ? getBeatmapById(song, beatmapId) : undefined;
	const vanillaOverrideScheme = beatmap?.colorSchemeName ? song.colorSchemesById[beatmap.colorSchemeName] : undefined;
	const environment = getEnvironment(song, beatmapId);
	const envScheme = deriveColorSchemeFromEnvironment(patchEnvironmentName(environment));

	function resolveColor<T extends string | undefined>(key: ColorSchemeKey): T {
		if (customOverrideScheme?.isEnabled && customOverrideScheme[key]) return customOverrideScheme[key] as T;
		if (vanillaOverrideScheme) return vanillaOverrideScheme[key] as T;
		return envScheme[key] as T;
	}

	return {
		colorLeft: resolveColor("colorLeft"),
		colorRight: resolveColor("colorRight"),
		obstacleColor: resolveColor("obstacleColor"),
		envColorLeft: resolveColor("envColorLeft"),
		envColorRight: resolveColor("envColorRight"),
		envColorLeftBoost: resolveColor("envColorLeftBoost"),
		envColorRightBoost: resolveColor("envColorRightBoost"),
	};
}

export function getExtensionsModule<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T) {
	const modSettings = getModSettings(song);
	return modSettings.mappingExtensions;
}
export function getGridSize<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T): IGrid {
	const mappingExtensions = getExtensionsModule(song);
	// In legacy states, `mappingExtensions` was a boolean, and it was possible to not have the key at all.
	const isLegacy = typeof mappingExtensions === "boolean" || !mappingExtensions;
	const isDisabled = mappingExtensions?.isEnabled === false;
	if (isLegacy || isDisabled) return DEFAULT_GRID;
	return deepAssign<IGrid>(DEFAULT_GRID, {
		numRows: mappingExtensions.numRows,
		numCols: mappingExtensions.numCols,
		colWidth: mappingExtensions.colWidth,
		rowHeight: mappingExtensions.rowHeight,
	});
}

export function sortBeatmaps(a: App.IBeatmap, b: App.IBeatmap) {
	const byCharacteristic = CharacteristicName.indexOf(a.characteristic) - CharacteristicName.indexOf(b.characteristic);
	if (byCharacteristic !== 0) return byCharacteristic;
	const byDifficulty = DifficultyName.indexOf(a.difficulty) - DifficultyName.indexOf(b.difficulty);
	if (byDifficulty !== 0) return byDifficulty;
	return 0;
}
