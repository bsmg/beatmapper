import { DIFFICULTIES } from "$/constants";
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
export function resolveDifficulty(id: BeatmapId): Member<typeof DIFFICULTIES> {
	for (const id of [...DIFFICULTIES].reverse()) {
		if (id.toString().includes(id)) return id.substring(0, id.length) as Member<typeof DIFFICULTIES>;
	}
	throw new Error(`Could not resolve difficulty from id: ${id}`);
}

export function sortBeatmaps(a: App.Beatmap, b: App.Beatmap) {
	const byCharacteristic = CharacteristicName.indexOf(a.characteristic) - CharacteristicName.indexOf(b.characteristic);
	if (byCharacteristic !== 0) return byCharacteristic;
	const byDifficulty = DifficultyName.indexOf(a.difficulty) - DifficultyName.indexOf(b.difficulty);
	if (byDifficulty !== 0) return byDifficulty;
	return 0;
}
