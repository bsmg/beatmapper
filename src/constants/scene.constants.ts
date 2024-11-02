import type { Vector3Tuple } from "three";

import { Quality } from "$/types";

export const BLOCK_SIZE = 1;
export const BLOCK_COLUMN_WIDTH = BLOCK_SIZE * 1.175;
export const BLOCK_PLACEMENT_SQUARE_SIZE = BLOCK_COLUMN_WIDTH;
export const BEAT_DEPTH = BLOCK_SIZE * 8;
export const SONG_OFFSET = 6;

// How wide is the platform the notes float above?
export const SURFACE_WIDTH = 6.5;
export const SURFACE_HEIGHT = 0.5;

export const SURFACE_DEPTHS = {
	[Quality.LOW]: 38,
	[Quality.MEDIUM]: 55,
	[Quality.HIGH]: 75,
} as const;

export const LASER_COLORS = {
	red: "#ff000c",
	blue: "#123bff",
	"red-bright": "#ff5a62",
	"blue-bright": "#5f7bff",
	off: "#000000",
} as const;

export const GRID_POSITION: Vector3Tuple = [0, 0, -SONG_OFFSET] as const;
