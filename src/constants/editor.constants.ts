import { tickSwitchSfxPath, tickWoodblockSfxPath } from "$/assets";

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

export const SNAPPING_INCREMENTS = [
	{ value: 1 / 64, label: "1/64 Beat" } as const,
	{ value: 1 / 32, label: "1/32 Beat" } as const,
	{ value: 1 / 24, label: "1/24 Beat" } as const,
	{ value: 1 / 16, label: "1/16 Beat", shortcutKey: 1 } as const,
	{ value: 1 / 12, label: "1/12 Beat" } as const,
	{ value: 1 / 8, label: "1/8 Beat", shortcutKey: 2 } as const,
	{ value: 1 / 6, label: "1/6 Beat" } as const,
	{ value: 1 / 4, label: "1/4 Beat", shortcutKey: 3 } as const,
	{ value: 1 / 3, label: "1/3 Beat" } as const,
	{ value: 1 / 2, label: "1/2 Beat", shortcutKey: 4 } as const,
	{ value: 1, label: "1 Beat", shortcutKey: 5 } as const,
	{ value: 2, label: "2 Beats", shortcutKey: 6 } as const,
	{ value: 4, label: "1 Bar", shortcutKey: 7 } as const,
	{ value: 8, label: "2 Bars", shortcutKey: 8 } as const,
	{ value: 16, label: "4 Bars", shortcutKey: 9 } as const,
];

export const HIGHEST_PRECISION = SNAPPING_INCREMENTS[0].value;

export const BEATS_PER_ZOOM_LEVEL = [32, 16, 8, 4, 2] as const;

export const ZOOM_LEVEL_MIN = 0;
export const ZOOM_LEVEL_MAX = 4;

export const NOTE_TICK_TYPES = [tickWoodblockSfxPath, tickSwitchSfxPath] as const;
