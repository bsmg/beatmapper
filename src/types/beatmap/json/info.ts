import type { Accept } from "../../utils";
import type { Difficulty } from "../shared";

export interface BeatmapDifficulty {
	_difficulty: Difficulty;
	_difficultyRank: Accept<1 | 3 | 5 | 7 | 9, number>;
	_beatmapFilename: string;
	_noteJumpMovementSpeed: 16;
	_noteJumpStartBeatOffset: 0;
	// biome-ignore lint/suspicious/noExplicitAny: valid use case
	_customData?: Record<string, any>;
}

export interface BeatmapSet {
	_difficultyBeatmaps: BeatmapDifficulty[];
}
