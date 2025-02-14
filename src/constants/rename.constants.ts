import { App, Difficulty, Environment } from "$/types";

export const BEATMAP_COLOR_KEY_RENAME = {
	[App.BeatmapColorKey.SABER_LEFT]: "Left Saber",
	[App.BeatmapColorKey.SABER_RIGHT]: "Right Saber",
	[App.BeatmapColorKey.ENV_LEFT]: "Environment 1",
	[App.BeatmapColorKey.ENV_RIGHT]: "Environment 2",
	[App.BeatmapColorKey.OBSTACLE]: "Obstacles",
} as const;

export const DIFFICULTY_RENAME = {
	[Difficulty.EASY]: "Easy",
	[Difficulty.NORMAL]: "Normal",
	[Difficulty.HARD]: "Hard",
	[Difficulty.EXPERT]: "Expert",
	[Difficulty.EXPERT_PLUS]: "Expert+",
} as const;

export const ENVIRONMENT_RENAME: Record<Environment, string> = {
	[Environment.THE_FIRST]: "The First",
	[Environment.ORIGINS]: "Origins",
	[Environment.TRIANGLE]: "Triangle",
	[Environment.BIG_MIRROR]: "Big Mirror",
	[Environment.NICE]: "Nice",
	[Environment.KDA]: "K/DA",
	[Environment.MONSTERCAT]: "Monstercat",
	[Environment.DRAGONS]: "Dragons",
	[Environment.CRAB_RAVE]: "Crab Rave",
	[Environment.PANIC]: "Panic",
} as const;
