import { CharacteristicName, DifficultyName } from "bsmap/types";

import { ColorSchemeKey } from "$/types";

export const CHARACTERISTICS = [CharacteristicName[0], CharacteristicName[1], CharacteristicName[2], CharacteristicName[3]];
export const DIFFICULTIES = [DifficultyName[0], DifficultyName[1], DifficultyName[2], DifficultyName[3], DifficultyName[4]] as const;

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
	[DifficultyName[0]]: 10,
	[DifficultyName[1]]: 10,
	[DifficultyName[2]]: 12,
	[DifficultyName[3]]: 15,
	[DifficultyName[4]]: 18,
	[DifficultyName[5]]: 18,
} as const;

export const DEFAULT_COLOR_SCHEME = {
	[ColorSchemeKey.SABER_LEFT]: "#c03030",
	[ColorSchemeKey.SABER_RIGHT]: "#2064a8",
	[ColorSchemeKey.OBSTACLE]: "#ff3030",
	[ColorSchemeKey.ENV_LEFT]: "#c03030",
	[ColorSchemeKey.ENV_RIGHT]: "#3098ff",
	[ColorSchemeKey.BOOST_LEFT]: "#c03030",
	[ColorSchemeKey.BOOST_RIGHT]: "#3098ff",
} as const;
