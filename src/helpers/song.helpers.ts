import { DifficultyRename } from "bsmap";

import { DIFFICULTIES } from "$/constants";
import type { App, BeatmapId, Member } from "$/types";
import { slugify } from "$/utils";

export function resolveSongId(x: Pick<App.Song, "name">): string {
	return slugify(x.name);
}
export function resolveBeatmapId(filename: string): string {
	let fn = filename;
	for (const ext of [".json", ".dat", ".beatmap", ".lightshow"]) {
		fn = fn.replace(ext, "");
	}
	return fn;
}

export function resolveDifficulty(id: BeatmapId): Member<typeof DIFFICULTIES> {
	for (const difficulty of [...DIFFICULTIES].reverse()) {
		if (id.toString().includes(difficulty)) return difficulty.substring(0, difficulty.length) as Member<typeof DIFFICULTIES>;
	}
	throw new Error(`Could not resolve difficulty from id: ${id}`);
}
export function resolveRankForDifficulty(difficulty: Member<typeof DIFFICULTIES>) {
	const rank = DIFFICULTIES.indexOf(difficulty);
	if (rank === -1) throw new Error(`Unrecognized difficulty: ${difficulty}`);
	return ((rank + 1) * 2 - 1) as 1 | 3 | 5 | 7 | 9;
}

export function getLabelForDifficulty(beatmapId: BeatmapId) {
	const difficulty = resolveDifficulty(beatmapId);
	return DifficultyRename[difficulty];
}

export function sortBeatmapIds(ids: BeatmapId[]) {
	return ids.sort((a, b) => {
		const aIndex = DIFFICULTIES.indexOf(resolveDifficulty(a));
		const bIndex = DIFFICULTIES.indexOf(resolveDifficulty(b));
		return aIndex > bIndex ? 1 : -1;
	});
}
