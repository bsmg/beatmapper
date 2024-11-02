import type { EntityId } from "@reduxjs/toolkit";
import type { Direction, ObstacleType, SaberColor } from "./shared";

// NOTE: This type is unused. Planning to migrate to it, but for now I'm using the raw "note" type, with all the underscore-prefixed fields used in-game.
export interface BlockNext {
	id: EntityId;
	color: SaberColor;
	direction: Direction;
	beatNum: number;
	rowIndex: number;
	colIndex: number;
	selected?: boolean;
}

export interface OriginalObstacle {
	id: EntityId;
	/** Lane: which column does this box START on? */
	lane: number;
	/** Type: Whether this is a vertical wall or a horizontal overhead ceiling */
	type: ObstacleType;
	/** beatStart: the number of beats that the song starts at */
	beatStart: number;
	/** beatDuration: the number of beats it should exist for */
	beatDuration: number;
	/** colspan: the number of columns this lane occupies */
	colspan: number;
	/** When initially placing an obstacle, it will exist in a limbo state, only becoming real once the user releases the mouse */
	tentative?: boolean;
	selected?: boolean;
	/** Should the wall fly by as a decorative entity? */
	fast?: boolean;
}
export interface MappingExtensionObstacle extends OriginalObstacle {
	type: typeof ObstacleType.EXTENDED;
	rowIndex: number;
	rowspan: number;
}
export type Obstacle = OriginalObstacle | MappingExtensionObstacle;
