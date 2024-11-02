import slugify from "slugify";

import { DIFFICULTIES } from "$/constants";
import { type BeatmapId, Difficulty } from "$/types";

export function getSongIdFromName(songName: string): string {
	const songId = slugify(songName).toLowerCase();

	return songId;
}

export function getLabelForDifficulty(difficulty: BeatmapId) {
	if (difficulty === Difficulty.EXPERT_PLUS) {
		return "Expert+";
	}
	return difficulty;
}

export function sortDifficultyIds(difficultyIds: BeatmapId[]) {
	return difficultyIds.sort((a, b) => {
		const aIndex = DIFFICULTIES.indexOf(a as Difficulty);
		const bIndex = DIFFICULTIES.indexOf(b as Difficulty);
		return aIndex > bIndex ? 1 : -1;
	});
}
