import { toPascalCase } from "@std/text/to-pascal-case";

import { DEFAULT_GRID } from "$/constants";
import type { App, BeatmapId, ColorSchemeKey, IColorScheme, IGrid } from "$/types";
import { deepAssign } from "$/utils";
import { deriveColorSchemeFromEnvironment } from "./colors.helpers";

export function createSongId(x: Pick<App.ISong, "name">): string {
	return toPascalCase(x.name);
}
export function resolveSongId(x: Pick<App.ISong, "id">): string {
	return x.id.toString();
}
export function resolveBeatmapId(x: Pick<App.IBeatmap, "characteristic" | "difficulty">): string {
	if (x.characteristic !== "Standard") return `${x.difficulty}${x.characteristic}`;
	return `${x.difficulty}`;
}

export function getEnvironment<T extends Pick<App.ISong, "environment" | "difficultiesById">>(song: T, beatmapId?: BeatmapId) {
	const beatmap = beatmapId ? song.difficultiesById[beatmapId] : null;
	return beatmap ? beatmap.environmentName : song.environment;
}
export function getColorScheme<T extends Pick<App.ISong, "environment" | "colorSchemesById" | "difficultiesById" | "modSettings">>(song: T, beatmapId?: BeatmapId): IColorScheme {
	const customOverrideScheme = song.modSettings.customColors;
	const beatmap = beatmapId ? song.difficultiesById[beatmapId] : null;
	const vanillaOverrideScheme = beatmap?.colorSchemeName ? song.colorSchemesById[beatmap.colorSchemeName] : null;
	const environment = getEnvironment(song, beatmapId);
	const envScheme = deriveColorSchemeFromEnvironment(environment);

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
		envColorWhite: resolveColor("envColorWhite"),
		envColorLeftBoost: resolveColor("envColorLeftBoost"),
		envColorRightBoost: resolveColor("envColorRightBoost"),
		envColorWhiteBoost: resolveColor("envColorWhiteBoost"),
	};
}
export function getGridSize<T extends Pick<App.ISong, "modSettings" | "difficultiesById" | "environment" | "colorSchemesById">>(song: T): IGrid {
	const mappingExtensions = song.modSettings.mappingExtensions;
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
