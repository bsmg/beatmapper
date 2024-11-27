import { DIFFICULTIES } from "$/constants";
import { type App, type BeatmapId, Difficulty } from "$/types";
import { slugify } from "$/utils";

export function resolveSongId(x: Pick<App.Song, "name">): string {
	return slugify(x.name);
}

export function getLabelForDifficulty(difficulty: BeatmapId) {
	if (difficulty === Difficulty.EXPERT_PLUS) {
		return "Expert+";
	}
	return difficulty;
}

export function sortBeatmapIds(ids: BeatmapId[]) {
	return ids.sort((a, b) => {
		const aIndex = DIFFICULTIES.indexOf(a as Difficulty);
		const bIndex = DIFFICULTIES.indexOf(b as Difficulty);
		return aIndex > bIndex ? 1 : -1;
	});
}
