import { DIFFICULTY_RENAME } from "$/constants";
import { type App, type BeatmapId, Difficulty } from "$/types";
import { slugify } from "$/utils";

export function resolveSongId(x: Pick<App.Song, "name">): string {
	return slugify(x.name);
}

export function resolveDifficulty(id: BeatmapId): Difficulty {
	for (const difficulty of Object.values(Difficulty).reverse()) {
		if (id.toString().includes(difficulty)) return difficulty;
	}
	throw new Error(`Could not resolve difficulty from id: ${id}`);
}
export function resolveRankForDifficulty(difficulty: Difficulty) {
	const rank = Object.values(Difficulty).indexOf(difficulty);
	if (rank === -1) throw new Error(`Unrecognized difficulty: ${difficulty}`);
	return ((rank + 1) * 2 - 1) as 1 | 3 | 5 | 7 | 9;
}

export function getLabelForDifficulty(beatmapId: BeatmapId) {
	const difficulty = resolveDifficulty(beatmapId);
	return DIFFICULTY_RENAME[difficulty];
}

export function sortBeatmapIds(ids: BeatmapId[]) {
	const DIFFICULTIES = Object.values(Difficulty);
	return ids.sort((a, b) => {
		const aIndex = DIFFICULTIES.indexOf(resolveDifficulty(a));
		const bIndex = DIFFICULTIES.indexOf(resolveDifficulty(b));
		return aIndex > bIndex ? 1 : -1;
	});
}
