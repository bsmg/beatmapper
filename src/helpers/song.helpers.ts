import { DEFAULT_COLOR_SCHEME, DEFAULT_GRID, DEFAULT_MOD_SETTINGS, DIFFICULTIES } from "$/constants";
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
/** @deprecated this is really only used during migration flow, don't use this elsewhere */
export function resolveDifficultyFromBeatmapId(id: BeatmapId): Member<typeof DIFFICULTIES> {
	for (const id of [...DIFFICULTIES].reverse()) {
		if (id.toString().includes(id)) return id.substring(0, id.length) as Member<typeof DIFFICULTIES>;
	}
	throw new Error(`Could not resolve difficulty from id: ${id}`);
}

export function isSongReadonly(song: App.Song) {
	return !!song.demo;
}
export function isModuleEnabled(song: App.Song, key: keyof App.ModSettings) {
	return !!song.modSettings[key]?.isEnabled;
}
export function isFastWallsEnabled(song: App.Song) {
	return !!song.enabledFastWalls;
}
export function isLightshowEnabled(song: App.Song) {
	return !!song.enabledLightshow;
}

export function getSongMetadata(song: App.Song) {
	return { title: song.name, subtitle: song.subName, artist: song.artistName };
}
export function getBeatmaps(song: App.Song) {
	return song.difficultiesById;
}
export function getAllBeatmaps(song: App.Song) {
	return Object.values(song.difficultiesById).sort(sortBeatmaps);
}
export function getBeatmapIds(song: App.Song) {
	return getAllBeatmaps(song).map((beatmap) => beatmap.beatmapId);
}
export function getBeatmapById(song: App.Song, beatmapId: BeatmapId) {
	return song.difficultiesById[beatmapId];
}
export function getSelectedBeatmap(song: App.Song) {
	return song.selectedDifficulty ?? Object.keys(song.difficultiesById)[0];
}
export function getEditorOffset(song: App.Song) {
	return song.offset;
}
export function getSongLastOpenedAt(song: App.Song) {
	return song.lastOpenedAt ?? 0;
}
export function getModSettings(song: App.Song) {
	return song.modSettings;
}
export function getColorScheme(song: App.Song) {
	const colors = song.modSettings.customColors;
	if (!colors) return DEFAULT_MOD_SETTINGS.customColors;
	return { ...DEFAULT_COLOR_SCHEME, ...colors };
}
export function getGridSize(song: App.Song) {
	const mappingExtensions = song?.modSettings.mappingExtensions;
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
