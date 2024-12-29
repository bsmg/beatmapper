import { App, Difficulty } from "$/types/beatmap";

export const DEFAULT_NUM_COLS = 4;
export const DEFAULT_NUM_ROWS = 3;
export const DEFAULT_COL_WIDTH = 1;
export const DEFAULT_ROW_HEIGHT = 1;

export const DEFAULT_GRID = {
	numRows: DEFAULT_NUM_ROWS,
	numCols: DEFAULT_NUM_COLS,
	colWidth: DEFAULT_COL_WIDTH,
	rowHeight: DEFAULT_ROW_HEIGHT,
} as const;

export const DEFAULT_NOTE_JUMP_SPEEDS = {
	[Difficulty.EASY]: 10,
	[Difficulty.NORMAL]: 10,
	[Difficulty.HARD]: 12,
	[Difficulty.EXPERT]: 15,
	[Difficulty.EXPERT_PLUS]: 18,
} as const;

export const DEFAULT_COLOR_SCHEME = {
	[App.BeatmapColorKey.SABER_LEFT]: "#c03030",
	[App.BeatmapColorKey.SABER_RIGHT]: "#2064a8",
	[App.BeatmapColorKey.ENV_LEFT]: "#c03030",
	[App.BeatmapColorKey.ENV_RIGHT]: "#3098ff",
	[App.BeatmapColorKey.OBSTACLE]: "#ff3030",
} as const;

export const DEFAULT_MOD_SETTINGS = {
	customColors: {
		isEnabled: false,
		...DEFAULT_COLOR_SCHEME,
		colorLeftOverdrive: 0,
		colorRightOverdrive: 0,
		envColorLeftOverdrive: 0,
		envColorRightOverdrive: 0,
		obstacleColorOverdrive: 0,
	},
	mappingExtensions: {
		isEnabled: false,
		...DEFAULT_GRID,
	},
} as const;

export const COLOR_OVERDRIVE_MULTIPLIER = {
	[App.BeatmapColorKey.SABER_LEFT]: 5,
	[App.BeatmapColorKey.SABER_RIGHT]: 5,
	[App.BeatmapColorKey.ENV_LEFT]: 3,
	[App.BeatmapColorKey.ENV_RIGHT]: 3,
	[App.BeatmapColorKey.OBSTACLE]: 10,
} as const;
