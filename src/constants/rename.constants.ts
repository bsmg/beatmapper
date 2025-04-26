import { App } from "$/types";

export const BEATMAP_COLOR_KEY_RENAME = {
	[App.BeatmapColorKey.SABER_LEFT]: "Left Saber",
	[App.BeatmapColorKey.SABER_RIGHT]: "Right Saber",
	[App.BeatmapColorKey.ENV_LEFT]: "Environment 1",
	[App.BeatmapColorKey.ENV_RIGHT]: "Environment 2",
	[App.BeatmapColorKey.OBSTACLE]: "Obstacles",
} as const;
