import { DEFAULT_GRID, DEFAULT_MOD_SETTINGS, DIFFICULTIES } from "$/constants";
import type { App, BeatmapId, Member } from "$/types";
import { slugify } from "$/utils";
import { CharacteristicName, DifficultyName } from "bsmap/types";

export function resolveSongId(x: Pick<App.Song, "name">): string {
	return slugify(x.name);
}
export function resolveBeatmapId(x: Pick<App.Beatmap, "characteristic" | "difficulty">): string {
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
export function resolveDifficultyFromBeatmapId(id: BeatmapId): Member<typeof DIFFICULTIES> {
	for (const id of [...DIFFICULTIES].reverse()) {
		if (id.toString().includes(id)) return id.substring(0, id.length) as Member<typeof DIFFICULTIES>;
	}
	throw new Error(`Could not resolve difficulty from id: ${id}`);
}

export function isSongReadonly<T extends Pick<App.Song, "demo">>(song: T) {
	return !!song.demo;
}
export function isModuleEnabled<T extends Pick<App.Song, "modSettings">>(song: T, key: keyof App.ModSettings) {
	return !!song.modSettings[key]?.isEnabled;
}
export function isFastWallsEnabled<T extends Pick<App.Song, "enabledFastWalls">>(song: T) {
	return !!song.enabledFastWalls;
}
export function isLightshowEnabled<T extends Pick<App.Song, "enabledLightshow">>(song: T) {
	return !!song.enabledLightshow;
}

export function getSongMetadata<T extends Pick<App.Song, "name" | "subName" | "artistName">>(song: T) {
	return { title: song.name, subtitle: song.subName, artist: song.artistName };
}
export function getBeatmaps<T extends Pick<App.Song, "difficultiesById">>(song: T) {
	return song.difficultiesById;
}
export function getAllBeatmaps<T extends Pick<App.Song, "difficultiesById">>(song: T) {
	return Object.values(song.difficultiesById).sort(sortBeatmaps);
}
export function getBeatmapIds<T extends Pick<App.Song, "difficultiesById">>(song: T) {
	return getAllBeatmaps(song).map((beatmap) => beatmap.beatmapId);
}
export function getBeatmapById<T extends Pick<App.Song, "difficultiesById">>(song: T, beatmapId: BeatmapId) {
	return song.difficultiesById[beatmapId];
}
export function getSelectedBeatmap<T extends Pick<App.Song, "selectedDifficulty" | "difficultiesById">>(song: T) {
	return song.selectedDifficulty ?? Object.keys(song.difficultiesById)[0];
}
export function getEditorOffset<T extends Pick<App.Song, "offset">>(song: T) {
	return song.offset;
}
export function getSongLastOpenedAt<T extends Pick<App.Song, "lastOpenedAt">>(song: T) {
	return song.lastOpenedAt ?? 0;
}
export function getModSettings<T extends Pick<App.Song, "modSettings">>(song: T) {
	return song.modSettings ?? DEFAULT_MOD_SETTINGS;
}
export function getCustomColorsModule<T extends Pick<App.Song, "modSettings">>(song: T) {
	const colors = song.modSettings?.customColors;
	return { ...DEFAULT_MOD_SETTINGS.customColors, ...colors };
}
export function getExtensionsModule<T extends Pick<App.Song, "modSettings">>(song: T) {
	const extensions = song.modSettings?.mappingExtensions;
	return { ...DEFAULT_MOD_SETTINGS.mappingExtensions, ...extensions };
}
export function getGridSize<T extends Pick<App.Song, "modSettings">>(song: T) {
	const mappingExtensions = getExtensionsModule(song);
	// In legacy states, `mappingExtensions` was a boolean, and it was possible to not have the key at all.
	const isLegacy = typeof mappingExtensions === "boolean" || !mappingExtensions;
	const isDisabled = mappingExtensions?.isEnabled === false;
	if (isLegacy || isDisabled) return DEFAULT_GRID;
	return {
		...DEFAULT_GRID,
		numRows: mappingExtensions.numRows,
		numCols: mappingExtensions.numCols,
		colWidth: mappingExtensions.colWidth,
		rowHeight: mappingExtensions.rowHeight,
	};
}

export function sortBeatmaps(a: App.Beatmap, b: App.Beatmap) {
	const byCharacteristic = CharacteristicName.indexOf(a.characteristic) - CharacteristicName.indexOf(b.characteristic);
	if (byCharacteristic !== 0) return byCharacteristic;
	const byDifficulty = DifficultyName.indexOf(a.difficulty) - DifficultyName.indexOf(b.difficulty);
	if (byDifficulty !== 0) return byDifficulty;
	return 0;
}
