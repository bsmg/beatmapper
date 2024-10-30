import { App, Difficulty, Environment } from "$/types/beatmap";
import { TrackType } from "$/types/editor";
import { DEFAULT_BLUE, DEFAULT_LIGHT_BLUE, DEFAULT_LIGHT_RED, DEFAULT_OBSTACLE, DEFAULT_RED } from "./theme.constants";
import { EVENT_TRACKS } from "./tracks.constants";

export const DIFFICULTIES = Object.freeze(Object.values(Difficulty));

export const HUMANIZED_DIRECTIONS = Object.freeze(Object.values(App.Direction));

export const TRACK_ID_MAP = Object.freeze(
	Object.entries(App.TrackId).reduce(
		(acc: Record<App.TrackId, number>, [index, value]) => {
			acc[`${value}`] = Number(index);
			return acc;
		},
		{} as Record<App.TrackId, number>,
	),
);

export const TRACK_IDS_ARRAY = Object.freeze(
	Object.entries(App.TrackId).reduce(
		(acc, [index, value]) => {
			acc[Number(index)] = value;
			return acc;
		},
		[] as (App.TrackId | null)[],
	),
);

export const LIGHT_EVENT_TYPES = {
	blue: {
		[App.EventType.OFF]: 0,
		[App.EventType.ON]: 1,
		[App.EventType.FLASH]: 2,
		[App.EventType.FADE]: 3,
	},
	red: {
		[App.EventType.OFF]: 0,
		[App.EventType.ON]: 5,
		[App.EventType.FLASH]: 6,
		[App.EventType.FADE]: 7,
	},
} as const;

export const LIGHT_EVENTS_ARRAY = [App.EventType.OFF, App.EventType.ON, App.EventType.FLASH, App.EventType.FADE, null, App.EventType.ON, App.EventType.FLASH, App.EventType.FADE] as const;

export const LIGHTING_TRACKS = Object.freeze(
	Object.values(EVENT_TRACKS)
		.filter(({ type }) => type === TrackType.LIGHT)
		.map(({ id }) => id),
);

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

export const DEFAULT_MOD_SETTINGS = {
	customColors: {
		isEnabled: false,
		colorLeft: DEFAULT_RED,
		colorLeftOverdrive: 0,
		colorRight: DEFAULT_BLUE,
		colorRightOverdrive: 0,
		envColorLeft: DEFAULT_LIGHT_RED,
		envColorLeftOverdrive: 0,
		envColorRight: DEFAULT_LIGHT_BLUE,
		envColorRightOverdrive: 0,
		obstacleColor: DEFAULT_OBSTACLE,
		obstacleColorOverdrive: 0,
	},
	mappingExtensions: {
		isEnabled: false,
		...DEFAULT_GRID,
	},
} as const;

export const COLOR_ELEMENT_IDS = Object.freeze(Object.values(App.BeatmapColorKey));

export const COLOR_ELEMENT_DATA = {
	[App.BeatmapColorKey.SABER_LEFT]: {
		label: "Left Saber",
		maxValue: 5,
	},
	[App.BeatmapColorKey.SABER_RIGHT]: {
		label: "Right Saber",
		maxValue: 5,
	},
	[App.BeatmapColorKey.ENV_LEFT]: {
		label: "Environment 1",
		maxValue: 3,
	},
	[App.BeatmapColorKey.ENV_RIGHT]: {
		label: "Environment 2",
		maxValue: 3,
	},
	[App.BeatmapColorKey.OBSTACLE]: {
		label: "Obstacles",
		maxValue: 10,
	},
} as const;

export const ENVIRONMENT_DISPLAY_MAP: Record<Environment, string> = {
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
