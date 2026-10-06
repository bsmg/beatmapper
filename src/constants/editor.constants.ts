import { default as tickSwitchSfxPath } from "$/assets/audio/switch.mp3";
import { default as tickWoodblockSfxPath } from "$/assets/audio/woodblock.mp3";

export const DEFAULT_NUM_COLS = 4;
export const DEFAULT_NUM_ROWS = 3;

export const DEFAULT_GRID = {
	numRows: DEFAULT_NUM_ROWS,
	numCols: DEFAULT_NUM_COLS,
	colWidth: 1,
	rowHeight: 1,
	colOffset: 0,
	rowOffset: 0,
} as const;

export const HIGHEST_PRECISION = 0.03125; // 1/32;

export const BEATS_PER_ZOOM_LEVEL = [32, 16, 8, 4, 2] as const;

export const ZOOM_LEVEL_MIN = 0;
export const ZOOM_LEVEL_MAX = 4;

export const NOTE_TICK_TYPES = [tickWoodblockSfxPath, tickSwitchSfxPath] as const;
